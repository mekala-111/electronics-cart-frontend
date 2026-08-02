"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { StoreChrome } from "@/components/layout/store-chrome";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle } from "@/components/shared/section-title";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { CtaButton } from "@/components/shared/cta-button";
import { Input } from "@/components/ui/input";
import { RequireAuth } from "@/components/shared/require-auth";
import { QueryState } from "@/components/shared/query-state";
import { useToast } from "@/components/shared/toast";
import { cn, formatInr } from "@/lib/utils";
import { useCartLines } from "@/hooks/use-cart";
import {
  usePlaceOrder,
  useWarehouses,
} from "@/hooks/use-checkout";
import {
  prefetchShippingMethods,
  useShippingEstimate,
  useShippingMethods,
} from "@/hooks/use-shipping";
import { useAddresses } from "@/hooks/use-addresses";
import {
  formatCouponFailure,
  useAppliedCoupon,
  useApplyCoupon,
  useCouponValidation,
  useRemoveCoupon,
} from "@/hooks/use-coupons";
import {
  isPaymentRetryable,
  isPaymentSuccessful,
  usePayment,
  usePaymentMethods,
  usePaymentVerification,
  useRetryPayment,
} from "@/hooks/use-payments";
import { useCheckoutUiStore, usePaymentUiStore, useShippingUiStore } from "@/store";
import { queryKeys } from "@/hooks/query-keys";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "@/validators/auth.schema";
import { describeApiError } from "@/types/api";
import type { CheckoutResult } from "@/types/checkout";
import type { ShippingQuote } from "@/types/shipping";
import { COUPON_CAPABILITY_MESSAGE } from "@/lib/coupon-capabilities";
import { SHIPPING_CAPABILITY_MESSAGE } from "@/lib/shipping-capabilities";
import { PAYMENT_CAPABILITY_MESSAGE } from "@/lib/payment-capabilities";
import {
  needsRazorpayCheckout,
  openRazorpayCheckout,
} from "@/lib/razorpay-checkout";
import { Button } from "@/components/ui/button";

const steps = ["Address", "Delivery", "Payment", "Confirmation"];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-danger" role="alert">
      {message}
    </p>
  );
}

export default function CheckoutClient() {
  return (
    <RequireAuth>
      <CheckoutFlow />
    </RequireAuth>
  );
}

function CheckoutFlow() {
  const step = useCheckoutUiStore((s) => s.step);
  const setStep = useCheckoutUiStore((s) => s.setStep);
  const cart = useCartLines();
  const items = cart.lines;
  const subtotal = cart.subtotal;
  const placeOrder = usePlaceOrder();
  const toast = useToast();
  const addresses = useAddresses();
  const warehouses = useWarehouses();
  const shippingMethods = useShippingMethods();
  const paymentMethods = usePaymentMethods();
  const validateCoupon = useCouponValidation();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const appliedCouponQuery = useAppliedCoupon();
  const appliedCoupon = appliedCouponQuery.data;
  const qc = useQueryClient();

  const [couponInput, setCouponInput] = useState("");
  const [placed, setPlaced] = useState<CheckoutResult | null>(null);
  const selectedQuoteId = useShippingUiStore((s) => s.selectedQuoteId);
  const setSelectedQuoteId = useShippingUiStore((s) => s.setSelectedQuoteId);
  const setSelectedMethodId = useShippingUiStore((s) => s.setSelectedMethodId);
  const paymentSubmitting = usePaymentUiStore((s) => s.submitting);
  const setPaymentSubmitting = usePaymentUiStore((s) => s.setSubmitting);
  const setPaymentMethodUi = usePaymentUiStore((s) => s.setSelectedMethodId);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      shippingMethodId: "",
      paymentMethodId: "",
      warehouseId: "",
      couponCode: "",
    },
    mode: "onTouched",
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  const postalCode = watch("postalCode");
  const paymentMethodId = watch("paymentMethodId");
  const shippingMethodId = watch("shippingMethodId");
  const warehouseId = watch("warehouseId");

  const selectedPayment = useMemo(() => {
    const methods = Array.isArray(paymentMethods.data) ? paymentMethods.data : [];
    return methods.find((m) => m.id === paymentMethodId);
  }, [paymentMethods.data, paymentMethodId]);
  const isCod = Boolean(
    selectedPayment?.code?.toLowerCase().includes("cod") ||
      selectedPayment?.name?.toLowerCase().includes("cash"),
  );

  const weightKg = useMemo(() => {
    const qty = items.reduce((n, i) => n + i.quantity, 0);
    return Math.max(1, qty * 0.5);
  }, [items]);

  const estimate = useShippingEstimate({
    toPincode: postalCode,
    weightKg,
    cod: isCod,
    declaredValue: subtotal,
    warehouseId: warehouseId || undefined,
    enabled: step >= 1 && Boolean(postalCode?.trim()),
  });

  const quotes = useMemo(
    () => (Array.isArray(estimate.data) ? estimate.data : []),
    [estimate.data],
  );
  const selectedQuote: ShippingQuote | undefined =
    quotes.find((q) => q.rateId === selectedQuoteId) ?? quotes[0];

  const discount = appliedCoupon?.discount ?? 0;
  const shippingCost = selectedQuote?.total;
  /** Aggregate of backend-provided components only (cart + estimate + coupon APIs). */
  const estimatedPayable =
    shippingCost != null
      ? Math.max(0, subtotal + shippingCost - discount)
      : Math.max(0, subtotal - discount);

  useEffect(() => {
    setStep(0);
    setPlaced(null);
    return () => setStep(0);
  }, [setStep]);

  useEffect(() => {
    const list = Array.isArray(warehouses.data) ? warehouses.data : [];
    if (!list.length || warehouseId) return;
    const preferred =
      list.find((w) => w.status === "active" || w.status === "ACTIVE") ?? list[0];
    if (preferred) setValue("warehouseId", preferred.id);
  }, [warehouses.data, warehouseId, setValue]);

  useEffect(() => {
    const methods = Array.isArray(paymentMethods.data) ? paymentMethods.data : [];
    if (!methods.length || paymentMethodId) return;
    const first = methods.find((m) => m.status === "active") ?? methods[0];
    if (first) {
      setValue("paymentMethodId", first.id);
      setPaymentMethodUi(first.id);
    }
  }, [paymentMethods.data, paymentMethodId, setValue, setPaymentMethodUi]);

  useEffect(() => {
    const methods = Array.isArray(shippingMethods.data) ? shippingMethods.data : [];
    if (!methods.length || shippingMethodId) return;
    const first =
      methods.find((m) => m.status === "active") ?? methods[0];
    if (first) {
      setValue("shippingMethodId", first.id);
      setSelectedMethodId(first.id);
    }
  }, [shippingMethods.data, shippingMethodId, setValue, setSelectedMethodId]);

  useEffect(() => {
    if (quotes.length && !selectedQuoteId) {
      setSelectedQuoteId(quotes[0].rateId);
    }
  }, [quotes, selectedQuoteId, setSelectedQuoteId]);

  useEffect(() => {
    // Address PIN / warehouse change → clear stale quote; estimate query key refetches
    setSelectedQuoteId(null);
  }, [postalCode, warehouseId, setSelectedQuoteId]);

  useEffect(() => {
    if (warehouseId) {
      void qc.invalidateQueries({ queryKey: queryKeys.shippingMethods });
    }
  }, [warehouseId, qc]);

  function prefillAddress(addr: {
    fullName: string;
    phone?: string | null;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country?: string | null;
  }) {
    setValue("fullName", addr.fullName);
    setValue("phone", addr.phone ?? "");
    setValue("line1", addr.line1);
    setValue("line2", addr.line2 ?? "");
    setValue("city", addr.city);
    setValue("state", addr.state);
    setValue("postalCode", addr.postalCode);
    setValue("country", addr.country ?? "India");
    setSelectedQuoteId(null);
    // PIN change refreshes estimate via query key; also refresh methods/warehouses
    void qc.invalidateQueries({ queryKey: queryKeys.shippingMethods });
    void qc.invalidateQueries({ queryKey: queryKeys.warehouses });
    void prefetchShippingMethods(qc);
  }

  async function onApplyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      toast.error("Coupon required", "Enter a coupon code");
      return;
    }
    try {
      const result = await validateCoupon.mutateAsync({
        code,
        cartTotal: subtotal,
      });
      if (!result.valid) {
        setValue("couponCode", "");
        toast.error("Invalid coupon", formatCouponFailure(result));
        return;
      }
      setValue("couponCode", result.code ?? code);
      toast.success("Coupon validated", result.code ? `${result.code} — discount from server` : "Discount from server");
      void estimate.refetch();
      void shippingMethods.refetch();
    } catch (err) {
      toast.error("Coupon failed", describeApiError(err));
    }
  }

  function onRemoveCoupon() {
    void removeCoupon.mutateAsync().then(() => {
      setCouponInput("");
      setValue("couponCode", "");
      toast.info("Coupon cleared", "Selection cleared — server has no unapply endpoint");
      void estimate.refetch();
    });
  }

  async function goNext() {
    if (step === 0) {
      const ok = await trigger([
        "fullName",
        "phone",
        "line1",
        "city",
        "state",
        "postalCode",
        "warehouseId",
      ]);
      if (!ok) {
        const v = form.getValues();
        const checked = checkoutFormSchema
          .pick({
            fullName: true,
            phone: true,
            line1: true,
            city: true,
            state: true,
            postalCode: true,
            warehouseId: true,
          })
          .safeParse(v);
        const detail = checked.success
          ? "Fix the highlighted fields"
          : checked.error.issues[0]?.message || "Fix the highlighted fields";
        toast.error("Address incomplete", detail);
        return;
      }
      if (!warehouseId) {
        toast.error("Warehouse unavailable", "No fulfillment warehouse returned by the server");
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await trigger(["shippingMethodId"]);
      if (!ok) {
        toast.error("Delivery required", "Select a delivery option");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      await handleSubmit(submitOrder)();
    }
  }

  async function submitOrder(values: CheckoutFormValues) {
    if (paymentSubmitting || placeOrder.isPending) return;
    setPaymentSubmitting(true);
    try {
      const result = await placeOrder.mutateAsync({
        cartId: cart.cartId,
        warehouseId: values.warehouseId,
        shipping: {
          fullName: values.fullName,
          phone: values.phone,
          line1: values.line1,
          line2: values.line2 || undefined,
          city: values.city,
          state: values.state,
          country: values.country || "India",
          postalCode: values.postalCode,
        },
        billing: {
          fullName: values.fullName,
          phone: values.phone,
          line1: values.line1,
          line2: values.line2 || undefined,
          city: values.city,
          state: values.state,
          country: values.country || "India",
          postalCode: values.postalCode,
        },
      });

      if (appliedCoupon?.code && result.order?.id) {
        try {
          await applyCoupon.mutateAsync({
            code: appliedCoupon.code,
            cartTotal: subtotal,
            orderId: result.order.id,
          });
        } catch {
          toast.error(
            "Order placed",
            "Coupon could not be attached to the order — contact support with your order number",
          );
        }
      }

      setPlaced(result);
      setStep(3);
    } catch (err) {
      toast.error("Checkout failed", describeApiError(err, "Could not place order"));
    } finally {
      setPaymentSubmitting(false);
    }
  }

  const orderRef =
    placed?.order?.orderNumber || placed?.order?.id || null;
  const orderTotal = placed?.order?.grandTotal;

  const bootLoading =
    (cart.isLoading && !cart.data) ||
    (warehouses.isLoading && !warehouses.data) ||
    (shippingMethods.isLoading && !shippingMethods.data) ||
    (paymentMethods.isLoading && !paymentMethods.data);

  const bootError =
    cart.isError || warehouses.isError || shippingMethods.isError || paymentMethods.isError;
  const bootErr =
    cart.error ?? warehouses.error ?? shippingMethods.error ?? paymentMethods.error;

  return (
    <StoreChrome>
      <PageShell className="section-pad">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <SectionTitle title="Checkout" accentWord="out" />

        <QueryState
          className="mt-8"
          isLoading={bootLoading}
          isError={bootError}
          error={bootErr}
          onRetry={() => {
            void cart.refetch();
            void warehouses.refetch();
            void shippingMethods.refetch();
            void paymentMethods.refetch();
          }}
          skeleton={<div className="h-64 animate-pulse rounded-[24px] border border-border bg-section" />}
        >
          {items.length === 0 && step < 3 ? (
            <div className="rounded-[24px] border border-border bg-white p-10 text-center shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
              <p className="text-muted">Your cart is empty.</p>
              <Link href="/products" className="mt-4 inline-block">
                <CtaButton label="Browse Products" />
              </Link>
            </div>
          ) : (
            <>
              <ol className="flex flex-wrap gap-3" aria-label="Checkout progress">
                {steps.map((s, i) => (
                  <li key={s} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                        i < step ? "bg-success text-white" : i === step ? "bg-primary text-white" : "bg-search text-muted",
                      )}
                      aria-current={i === step ? "step" : undefined}
                    >
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={cn("text-sm font-semibold", i === step ? "text-navy" : "text-muted")}>{s}</span>
                    {i < steps.length - 1 ? <span className="mx-1 hidden h-px w-8 bg-border sm:block" aria-hidden /> : null}
                  </li>
                ))}
              </ol>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="rounded-[24px] border border-border bg-white p-6 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
                  {step === 0 ? (
                    <div className="space-y-4">
                      {(addresses.data?.length ?? 0) > 0 ? (
                        <fieldset>
                          <legend className="mb-2 text-sm font-semibold text-navy">
                            Recent addresses
                          </legend>
                          <div className="space-y-2" role="listbox" aria-label="Saved addresses">
                            {addresses.data!.map((addr) => (
                              <button
                                key={addr.id ?? `${addr.line1}-${addr.postalCode}`}
                                type="button"
                                role="option"
                                aria-selected={watch("line1") === addr.line1 && watch("postalCode") === addr.postalCode}
                                className="w-full rounded-[18px] border border-border p-4 text-left text-sm hover:border-primary"
                                onClick={() => prefillAddress(addr)}
                              >
                                <span className="font-semibold text-navy">{addr.fullName}</span>
                                <span className="mt-1 block text-muted">
                                  {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
                                </span>
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      ) : null}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Input
                            placeholder="Full name"
                            aria-label="Full name"
                            aria-invalid={Boolean(errors.fullName)}
                            {...register("fullName")}
                          />
                          <FieldError message={errors.fullName?.message} />
                        </div>
                        <div>
                          <Input
                            placeholder="Phone"
                            aria-label="Phone"
                            aria-invalid={Boolean(errors.phone)}
                            {...register("phone")}
                          />
                          <FieldError message={errors.phone?.message} />
                        </div>
                        <div className="sm:col-span-2">
                          <Input
                            placeholder="Address line 1"
                            aria-label="Address"
                            aria-invalid={Boolean(errors.line1)}
                            {...register("line1")}
                          />
                          <FieldError message={errors.line1?.message} />
                        </div>
                        <div>
                          <Input
                            placeholder="City"
                            aria-label="City"
                            aria-invalid={Boolean(errors.city)}
                            {...register("city")}
                          />
                          <FieldError message={errors.city?.message} />
                        </div>
                        <div>
                          <Input
                            placeholder="PIN code"
                            aria-label="PIN code"
                            aria-invalid={Boolean(errors.postalCode)}
                            {...register("postalCode")}
                          />
                          <FieldError message={errors.postalCode?.message} />
                        </div>
                        <div className="sm:col-span-2">
                          <Input
                            placeholder="State"
                            aria-label="State"
                            aria-invalid={Boolean(errors.state)}
                            {...register("state")}
                          />
                          <FieldError message={errors.state?.message} />
                        </div>
                      </div>
                      {!warehouses.data?.length && !warehouses.isLoading ? (
                        <p className="text-sm text-danger" role="alert">
                          No warehouses available — checkout cannot continue.
                        </p>
                      ) : null}
                      <FieldError message={errors.warehouseId?.message} />
                    </div>
                  ) : null}

                  {step === 1 ? (
                    <div className="space-y-3" role="radiogroup" aria-label="Delivery options">
                      <p className="text-xs text-muted" role="note">
                        {SHIPPING_CAPABILITY_MESSAGE}
                      </p>
                      {(warehouses.data?.length ?? 0) > 1 ? (
                        <fieldset className="space-y-2">
                          <legend className="text-sm font-semibold text-navy">Warehouse</legend>
                          {(warehouses.data ?? []).map((w) => (
                            <label
                              key={w.id}
                              className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-border p-4 hover:border-primary"
                            >
                              <input
                                type="radio"
                                className="accent-primary"
                                name="warehouse"
                                checked={warehouseId === w.id}
                                onChange={() => setValue("warehouseId", w.id)}
                              />
                              <span className="text-sm font-semibold text-navy">
                                {w.name}
                                {w.city ? ` · ${w.city}` : ""}
                              </span>
                            </label>
                          ))}
                        </fieldset>
                      ) : null}
                      {shippingMethods.isError ? (
                        <p className="text-sm text-danger" role="alert">
                          {describeApiError(shippingMethods.error, "Could not load shipping methods")}
                        </p>
                      ) : null}
                      {estimate.isFetching ? (
                        <p className="text-xs text-muted" aria-live="polite">
                          Refreshing rates for PIN {postalCode}…
                        </p>
                      ) : null}
                      {estimate.isError ? (
                        <p className="text-sm text-danger" role="alert">
                          {describeApiError(
                            estimate.error,
                            "Address may not be serviceable for shipping",
                          )}
                        </p>
                      ) : null}
                      {!estimate.isLoading &&
                      !estimate.isError &&
                      postalCode.trim().length >= 4 &&
                      quotes.length === 0 ? (
                        <p className="text-sm text-muted" role="status">
                          No shipping rates returned for this PIN.
                        </p>
                      ) : null}
                      {(shippingMethods.data ?? []).map((method) => {
                        const quote =
                          quotes.find((q) => q.serviceId === method.id) ??
                          quotes.find((q) => q.partnerId === method.partnerId);
                        const labelParts = [
                          method.name,
                          method.serviceType ? `· ${method.serviceType}` : null,
                          quote ? `· ${formatInr(quote.total)}` : null,
                          method.isCodSupported ? "· COD ok" : null,
                        ].filter(Boolean);
                        return (
                          <label
                            key={method.id}
                            className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-border p-4 hover:border-primary"
                          >
                            <Controller
                              name="shippingMethodId"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="radio"
                                  className="accent-primary"
                                  checked={field.value === method.id}
                                  onChange={() => {
                                    field.onChange(method.id);
                                    setSelectedMethodId(method.id);
                                    if (quote) setSelectedQuoteId(quote.rateId);
                                  }}
                                />
                              )}
                            />
                            <span className="text-sm font-semibold text-navy">
                              {labelParts.join(" ")}
                            </span>
                          </label>
                        );
                      })}
                      {!shippingMethods.data?.length && !shippingMethods.isLoading ? (
                        <p className="text-sm text-muted">No shipping methods returned by the server.</p>
                      ) : null}
                      <FieldError message={errors.shippingMethodId?.message} />
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div className="space-y-4">
                      <div className="space-y-3" role="radiogroup" aria-label="Payment methods">
                        {(paymentMethods.data ?? []).map((method) => (
                          <label
                            key={method.id}
                            className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-border p-4 hover:border-primary"
                          >
                            <Controller
                              name="paymentMethodId"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="radio"
                                  className="accent-primary"
                                  checked={field.value === method.id}
                                  onChange={() => {
                                    field.onChange(method.id);
                                    setPaymentMethodUi(method.id);
                                  }}
                                />
                              )}
                            />
                            <span className="text-sm font-semibold text-navy">{method.name}</span>
                          </label>
                        ))}
                        {!paymentMethods.data?.length && !paymentMethods.isLoading ? (
                          <p className="text-sm text-muted">No payment methods returned by the server.</p>
                        ) : null}
                        <p className="text-xs text-muted">{PAYMENT_CAPABILITY_MESSAGE}</p>
                        <FieldError message={errors.paymentMethodId?.message} />
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Coupon code"
                          aria-label="Coupon code"
                          value={appliedCoupon?.code ?? couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          disabled={Boolean(appliedCoupon?.code)}
                        />
                        {appliedCoupon?.code ? (
                          <button
                            type="button"
                            className="rounded-[16px] border border-border px-4 text-sm font-semibold text-navy hover:border-primary"
                            onClick={onRemoveCoupon}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="rounded-[16px] border border-border px-4 text-sm font-semibold text-navy hover:border-primary"
                            disabled={validateCoupon.isPending}
                            onClick={() => void onApplyCoupon()}
                          >
                            {validateCoupon.isPending ? "…" : "Apply"}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted">{COUPON_CAPABILITY_MESSAGE}</p>
                    </div>
                  ) : null}

                  {step === 3 && placed?.order ? (
                    <CheckoutPaymentConfirmation
                      placed={placed}
                      orderRef={orderRef}
                      orderTotal={orderTotal}
                      paymentSubmitting={paymentSubmitting}
                      setPaymentSubmitting={setPaymentSubmitting}
                    />
                  ) : null}

                  {step < 3 ? (
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        disabled={step === 0 || placeOrder.isPending}
                        onClick={() => setStep(step - 1)}
                        className="rounded-[16px] border border-border px-6 py-3 text-sm font-semibold text-navy disabled:opacity-40"
                      >
                        Back
                      </button>
                      <CtaButton
                        label={
                          placeOrder.isPending
                            ? "Placing…"
                            : step === 2
                              ? "Pay & Place Order"
                              : "Continue"
                        }
                        disabled={
                          placeOrder.isPending || paymentSubmitting || !items.length
                        }
                        onClick={() => void goNext()}
                      />
                    </div>
                  ) : null}
                </div>

                <aside className="h-fit rounded-[24px] border border-border bg-white p-6 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
                  <h2 className="font-bold text-navy">Order Summary</h2>
                  <ul className="mt-3 space-y-2">
                    {items.map((line) => (
                      <li key={line.id} className="flex justify-between gap-2 text-sm">
                        <span className="text-muted">
                          {line.name || line.sku} × {line.quantity}
                        </span>
                        <span className="font-semibold text-navy">{formatInr(line.lineTotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Subtotal</span>
                      <span className="font-semibold text-navy">{formatInr(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Shipping</span>
                      <span className="font-semibold text-navy">
                        {shippingCost != null ? formatInr(shippingCost) : "—"}
                      </span>
                    </div>
                    {appliedCoupon?.code && discount > 0 ? (
                      <div className="flex justify-between">
                        <span className="text-muted">Discount ({appliedCoupon.code})</span>
                        <span className="font-semibold text-accent">-{formatInr(discount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span className="text-muted">Tax</span>
                      <span className="font-semibold text-navy">
                        {placed?.order?.taxTotal != null
                          ? formatInr(placed.order.taxTotal)
                          : "On invoice"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted">
                        {placed?.order?.grandTotal != null ? "Grand total" : "Payable"}
                      </span>
                      <span className="font-extrabold text-primary">
                        {formatInr(
                          placed?.order?.grandTotal != null
                            ? placed.order.grandTotal
                            : estimatedPayable,
                        )}
                      </span>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </QueryState>
      </PageShell>
    </StoreChrome>
  );
}

function CheckoutPaymentConfirmation({
  placed,
  orderRef,
  orderTotal,
  paymentSubmitting,
  setPaymentSubmitting,
}: {
  placed: CheckoutResult;
  orderRef: string | null;
  orderTotal?: number;
  paymentSubmitting: boolean;
  setPaymentSubmitting: (v: boolean) => void;
}) {
  const toast = useToast();
  const paymentId = placed.paymentId ?? undefined;
  const paymentQuery = usePayment(paymentId);
  const verify = usePaymentVerification();
  const retry = useRetryPayment();
  const status = paymentQuery.data?.status;
  const paid = isPaymentSuccessful(status);
  const retryable = isPaymentRetryable(status);
  const autoVerifyStarted = useRef(false);
  const razorpayOpened = useRef(false);

  useEffect(() => {
    autoVerifyStarted.current = false;
    razorpayOpened.current = false;
  }, [paymentId]);

  useEffect(() => {
    if (!paymentId || !paymentQuery.data) return;
    const payment = paymentQuery.data;
    if (payment.status === "captured") return;

    // Live Razorpay order → open Checkout.js; Nest authorize/capture only after pay.
    if (
      payment.status === "pending" &&
      needsRazorpayCheckout(payment.gatewayOrderId) &&
      !razorpayOpened.current
    ) {
      razorpayOpened.current = true;
      void openRazorpayCheckout({
        gatewayOrderId: payment.gatewayOrderId!,
        amountInr: payment.amount,
        currency: payment.currency ?? "INR",
        description: orderRef ? `Order ${orderRef}` : "Electronics Cart order",
        onSuccess: () => {
          void verify.mutateAsync(paymentId).catch(() => {
            razorpayOpened.current = false;
          });
        },
        onDismiss: () => {
          razorpayOpened.current = false;
        },
      }).catch(() => {
        razorpayOpened.current = false;
        toast.error("Could not open Razorpay", "Check NEXT_PUBLIC_RAZORPAY_KEY_ID");
      });
      return;
    }

    // Soft-launch / mock: saga usually captures already; complete via Nest if needed.
    if (autoVerifyStarted.current) return;
    if (needsRazorpayCheckout(payment.gatewayOrderId)) return;
    if (payment.status !== "pending" && payment.status !== "authorized") return;
    autoVerifyStarted.current = true;
    void verify.mutateAsync(paymentId).catch(() => {
      autoVerifyStarted.current = false;
    });
  }, [paymentId, paymentQuery.data, verify, orderRef, toast]);

  async function onPayWithRazorpay() {
    const payment = paymentQuery.data;
    if (!paymentId || !payment?.gatewayOrderId || paymentSubmitting) return;
    setPaymentSubmitting(true);
    try {
      await openRazorpayCheckout({
        gatewayOrderId: payment.gatewayOrderId,
        amountInr: payment.amount,
        currency: payment.currency ?? "INR",
        description: orderRef ? `Order ${orderRef}` : "Electronics Cart order",
        onSuccess: () => {
          void verify.mutateAsync(paymentId).then((result) => {
            if (isPaymentSuccessful(result.status)) {
              toast.success("Payment confirmed", result.status);
            } else {
              toast.error("Payment not complete", `Server status: ${result.status}`);
            }
          });
        },
      });
    } catch (err) {
      toast.error("Could not open Razorpay", describeApiError(err));
    } finally {
      setPaymentSubmitting(false);
    }
  }

  async function onVerify() {
    if (!paymentId || paymentSubmitting) return;
    setPaymentSubmitting(true);
    try {
      const result = await verify.mutateAsync(paymentId);
      if (isPaymentSuccessful(result.status)) {
        toast.success("Payment confirmed", result.status);
      } else {
        toast.error("Payment not complete", `Server status: ${result.status}`);
      }
    } catch (err) {
      toast.error("Payment verification failed", describeApiError(err));
    } finally {
      setPaymentSubmitting(false);
    }
  }

  async function onRetry() {
    if (!paymentId || paymentSubmitting) return;
    setPaymentSubmitting(true);
    try {
      const result = await retry.mutateAsync(paymentId);
      toast.info("Retry finished", `Server status: ${result.status}`);
    } catch (err) {
      toast.error("Retry failed", describeApiError(err));
    } finally {
      setPaymentSubmitting(false);
    }
  }

  return (
    <div className="py-6 text-center">
      <div
        className={cn(
          "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
          paid ? "bg-success/15 text-success" : "bg-search text-muted",
        )}
      >
        <Check className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-extrabold text-navy">
        {paid ? "Order confirmed" : "Order placed"}
      </h2>
      <p className="mt-2 text-muted">
        Order {orderRef}
        {orderTotal != null ? ` · ${formatInr(orderTotal)}` : ""}
      </p>
      {paymentId ? (
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          Payment status:{" "}
          <span className="font-semibold capitalize text-navy">
            {paymentQuery.isLoading && !paymentQuery.data
              ? "Loading…"
              : status ?? "unavailable"}
          </span>
          {paymentQuery.data?.gatewayOrderId
            ? ` · Gateway order ${paymentQuery.data.gatewayOrderId}`
            : ""}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">No payment id returned for this order.</p>
      )}
      <p className="mx-auto mt-2 max-w-md text-xs text-muted">{PAYMENT_CAPABILITY_MESSAGE}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {paymentId &&
        !paid &&
        needsRazorpayCheckout(paymentQuery.data?.gatewayOrderId) ? (
          <Button
            size="sm"
            type="button"
            disabled={paymentSubmitting}
            onClick={() => void onPayWithRazorpay()}
          >
            {paymentSubmitting ? "Opening…" : "Pay with Razorpay"}
          </Button>
        ) : null}
        {paymentId && !paid ? (
          <Button
            size="sm"
            type="button"
            variant={
              needsRazorpayCheckout(paymentQuery.data?.gatewayOrderId)
                ? "outline"
                : "primary"
            }
            disabled={paymentSubmitting || verify.isPending}
            onClick={() => void onVerify()}
          >
            {verify.isPending ? "Verifying…" : "Verify payment"}
          </Button>
        ) : null}
        {paymentId && retryable ? (
          <Button
            size="sm"
            variant="outline"
            type="button"
            disabled={paymentSubmitting || retry.isPending}
            onClick={() => void onRetry()}
          >
            {retry.isPending ? "Retrying…" : "Retry payment"}
          </Button>
        ) : null}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Link href={orderRef ? `/orders/track?order=${encodeURIComponent(orderRef)}` : "/orders/track"}>
          <CtaButton label="Track Order" />
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center rounded-[16px] border border-border px-7 py-4 text-[15px] font-semibold text-navy"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
