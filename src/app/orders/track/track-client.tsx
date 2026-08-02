"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StoreChrome } from "@/components/layout/store-chrome";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle } from "@/components/shared/section-title";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { CtaButton } from "@/components/shared/cta-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/shared/require-auth";
import { QueryState } from "@/components/shared/query-state";
import { useToast } from "@/components/shared/toast";
import { cn, formatInr } from "@/lib/utils";
import {
  useOrderPayments,
  usePaymentRefunds,
  useRetryPayment,
  isPaymentRetryable,
} from "@/hooks/use-payments";
import {
  formatOrderDateTime,
  useCancelOrder,
  useCancellationReasons,
  useOrder,
  useRequestReturn,
} from "@/hooks/use-orders";
import { describeApiError } from "@/types/api";
import { PAYMENT_CAPABILITY_MESSAGE } from "@/lib/payment-capabilities";
import {
  CANCELABLE_STATUSES,
  RETURNABLE_STATUSES,
  type OrderStatusEvent,
} from "@/types/orders";

function timelineFromHistory(history: OrderStatusEvent[]) {
  const sorted = [...history].sort((a, b) => {
    const ta = a.changedAt ? new Date(a.changedAt).getTime() : 0;
    const tb = b.changedAt ? new Date(b.changedAt).getTime() : 0;
    return ta - tb;
  });
  return sorted.map((h, i) => ({
    label: h.to,
    note: h.note,
    time: formatOrderDateTime(h.changedAt),
    done: i < sorted.length - 1 || Boolean(h.changedAt),
  }));
}

export default function TrackClient() {
  return (
    <RequireAuth>
      <TrackFlow />
    </RequireAuth>
  );
}

function TrackFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const orderParam = searchParams.get("order") ?? "";
  const [lookup, setLookup] = useState(orderParam);

  useEffect(() => {
    setLookup(orderParam);
  }, [orderParam]);

  const orderQuery = useOrder(orderParam || null);
  const order = orderQuery.data;
  const payments = useOrderPayments(order?.id);
  const primaryPayment = payments.data?.[0];
  const refunds = usePaymentRefunds(primaryPayment?.id);
  const retryPayment = useRetryPayment();
  const [paymentBusy, setPaymentBusy] = useState(false);
  const cancelOrder = useCancelOrder();
  const requestReturn = useRequestReturn();
  const [showCancel, setShowCancel] = useState(false);
  const [reasonId, setReasonId] = useState("");
  const reasons = useCancellationReasons(showCancel);
  const [returnItemId, setReturnItemId] = useState("");
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState("");
  const [showReturn, setShowReturn] = useState(false);

  const timeline = useMemo(
    () => timelineFromHistory(order?.statusHistory ?? []),
    [order?.statusHistory],
  );

  const shipping = order?.addresses?.find((a) => a.type === "shipping");
  const canCancel = order ? CANCELABLE_STATUSES.has(order.status) : false;
  const canReturn = order ? RETURNABLE_STATUSES.has(order.status) : false;
  const orderRef = order?.orderNumber || order?.id || orderParam;

  function goLookup(e: React.FormEvent) {
    e.preventDefault();
    const next = lookup.trim();
    if (!next) {
      toast.error("Order required", "Enter an order number or id");
      return;
    }
    router.replace(`/orders/track?order=${encodeURIComponent(next)}`);
  }

  async function onCancel() {
    if (!order) return;
    try {
      await cancelOrder.mutateAsync({
        orderId: order.id,
        body: {
          cancellationReasonId: reasonId || undefined,
          note: "Cancelled by customer",
        },
      });
      toast.success("Order cancelled", orderRef);
      setShowCancel(false);
    } catch (err) {
      toast.error("Cancel failed", describeApiError(err));
    }
  }

  async function onReturn() {
    if (!order || !returnItemId) {
      toast.error("Item required", "Select an item to return");
      return;
    }
    try {
      await requestReturn.mutateAsync({
        orderId: order.id,
        body: {
          orderItemId: returnItemId,
          quantity: returnQty,
          reason: returnReason || undefined,
        },
      });
      toast.success("Return requested", "Your return was submitted");
      setShowReturn(false);
    } catch (err) {
      toast.error("Return failed", describeApiError(err));
    }
  }

  return (
    <StoreChrome>
      <PageShell className="section-pad">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Orders", href: "/profile/orders" },
            { label: "Tracking" },
          ]}
        />
        <SectionTitle
          eyebrow="SHIPMENT"
          title="Order Tracking"
          accentWord="Tracking"
          subtitle={
            order
              ? `Order ${orderRef} · Status ${order.status}`
              : "Enter an order number to view status history from the server"
          }
        />

        <form onSubmit={goLookup} className="mt-6 flex max-w-lg flex-wrap gap-2">
          <Input
            placeholder="Order number or id"
            aria-label="Order number"
            value={lookup}
            onChange={(e) => setLookup(e.target.value)}
          />
          <Button type="submit" size="sm">
            Load
          </Button>
        </form>

        {!orderParam ? (
          <p className="mt-8 text-sm text-muted">
            Choose an order from your profile, or enter an order number above.
          </p>
        ) : (
          <QueryState
            className="mt-8"
            isLoading={orderQuery.isLoading && !orderQuery.data}
            isFetching={orderQuery.isFetching}
            isError={orderQuery.isError}
            error={orderQuery.error}
            onRetry={() => void orderQuery.refetch()}
            skeleton={
              <div className="h-64 animate-pulse rounded-[24px] border border-border bg-section" />
            }
          >
            {order ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                  <div className="rounded-[24px] border border-border bg-white p-6 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
                    {timeline.length === 0 ? (
                      <p className="text-sm text-muted">
                        No status history returned for this order yet.
                      </p>
                    ) : (
                      <ol className="space-y-0">
                        {timeline.map((t, i) => (
                          <li key={`${t.label}-${t.time}-${i}`} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <span
                                className={cn(
                                  "mt-1 h-3.5 w-3.5 rounded-full",
                                  t.done ? "bg-primary" : "bg-border",
                                )}
                              />
                              {i < timeline.length - 1 ? (
                                <span
                                  className={cn(
                                    "my-1 w-0.5 flex-1 min-h-10",
                                    t.done ? "bg-primary/40" : "bg-border",
                                  )}
                                />
                              ) : null}
                            </div>
                            <div className="pb-8">
                              <p className="font-bold capitalize text-navy">{t.label}</p>
                              <p className="text-sm text-muted">{t.time}</p>
                              {t.note ? (
                                <p className="mt-1 text-xs text-muted">{t.note}</p>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <div className="rounded-[24px] border border-border bg-white p-6 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
                    <p className="font-bold text-navy">Order details</p>
                    <ul className="mt-4 space-y-3">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-sm"
                        >
                          <span className="text-muted">
                            {item.name || item.sku} × {item.quantity}
                          </span>
                          <span className="font-semibold text-navy">
                            {formatInr(item.lineTotal)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">Subtotal</span>
                        <span className="font-semibold text-navy">
                          {formatInr(order.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Discount</span>
                        <span className="font-semibold text-navy">
                          {formatInr(order.discountTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Shipping</span>
                        <span className="font-semibold text-navy">
                          {formatInr(order.shippingCharge)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Tax</span>
                        <span className="font-semibold text-navy">
                          {formatInr(order.taxTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-muted">Grand total</span>
                        <span className="font-extrabold text-primary">
                          {formatInr(order.grandTotal)}
                        </span>
                      </div>
                    </div>
                    {shipping ? (
                      <p className="mt-4 text-sm text-muted">
                        Ship to {shipping.fullName}, {shipping.line1}, {shipping.city},{" "}
                        {shipping.state} {shipping.postalCode}
                      </p>
                    ) : null}
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-[24px] border border-border bg-white p-5 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
                    <p className="font-bold text-navy">Package status</p>
                    <p className="mt-2 text-sm capitalize text-muted">{order.status}</p>
                    <p className="mt-2 text-xs text-muted">
                      Carrier / AWB tracking is not exposed on the customer order API.
                      Timeline above is order status history from the server.
                    </p>
                    {primaryPayment ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-muted" aria-live="polite">
                          Payment: {primaryPayment.status}
                          {primaryPayment.refundedAmount
                            ? ` · Refunded ${formatInr(primaryPayment.refundedAmount)}`
                            : ""}
                        </p>
                        <p className="text-xs text-muted">{PAYMENT_CAPABILITY_MESSAGE}</p>
                        {isPaymentRetryable(primaryPayment.status) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            className="w-full"
                            disabled={paymentBusy || retryPayment.isPending}
                            onClick={() => {
                              void (async () => {
                                setPaymentBusy(true);
                                try {
                                  const result = await retryPayment.mutateAsync(
                                    primaryPayment.id,
                                  );
                                  toast.info(
                                    "Retry finished",
                                    `Server status: ${result.status}`,
                                  );
                                } catch (err) {
                                  toast.error(
                                    "Retry failed",
                                    describeApiError(err),
                                  );
                                } finally {
                                  setPaymentBusy(false);
                                }
                              })();
                            }}
                          >
                            {retryPayment.isPending ? "Retrying…" : "Retry payment"}
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                    {(refunds.data?.length ?? 0) > 0 ? (
                      <ul className="mt-2 space-y-1 text-xs text-muted">
                        {refunds.data!.map((r) => (
                          <li key={r.id}>
                            Refund {r.refundNumber || r.id}: {r.status} ·{" "}
                            {formatInr(r.amount)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <button
                      type="button"
                      disabled
                      title="Customer invoice download endpoint is not available"
                      className="mt-4 w-full cursor-not-allowed rounded-[16px] border border-border py-3 text-sm font-semibold text-muted opacity-60"
                    >
                      Download invoice
                    </button>
                    {canCancel ? (
                      <Button
                        className="mt-3 w-full"
                        variant="outline"
                        type="button"
                        onClick={() => setShowCancel(true)}
                      >
                        Cancel order
                      </Button>
                    ) : null}
                    {canReturn ? (
                      <Button
                        className="mt-3 w-full"
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setShowReturn(true);
                          setReturnItemId(order.items[0]?.id ?? "");
                          setReturnQty(1);
                        }}
                      >
                        Request return
                      </Button>
                    ) : null}
                  </div>
                  <div className="rounded-[24px] border border-border bg-white p-5 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
                    <p className="font-bold text-navy">Need help?</p>
                    <p className="mt-2 text-sm text-muted">
                      Raise a support ticket for delivery issues.
                    </p>
                    <Link href="/profile/support" className="mt-4 block">
                      <CtaButton label="Contact support" className="w-full" />
                    </Link>
                  </div>
                </aside>
              </div>
            ) : null}
          </QueryState>
        )}

        {showCancel && order ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="track-cancel-title"
          >
            <div className="w-full max-w-md rounded-[24px] border border-border bg-white p-6">
              <h2 id="track-cancel-title" className="text-lg font-bold text-navy">
                Cancel order?
              </h2>
              <p className="mt-2 text-sm text-muted">{orderRef}</p>
              {(reasons.data?.length ?? 0) > 0 ? (
                <label className="mt-4 block text-sm font-semibold text-navy">
                  Reason
                  <select
                    className="mt-2 w-full rounded-[16px] border border-border px-4 py-3 text-sm"
                    value={reasonId}
                    onChange={(e) => setReasonId(e.target.value)}
                  >
                    <option value="">Select reason</option>
                    {reasons.data!.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setShowCancel(false)}
                >
                  Keep order
                </Button>
                <Button
                  size="sm"
                  type="button"
                  disabled={cancelOrder.isPending}
                  onClick={() => void onCancel()}
                >
                  {cancelOrder.isPending ? "Cancelling…" : "Confirm cancel"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {showReturn && order ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-title"
          >
            <div className="w-full max-w-md rounded-[24px] border border-border bg-white p-6">
              <h2 id="return-title" className="text-lg font-bold text-navy">
                Request return
              </h2>
              <label className="mt-4 block text-sm font-semibold text-navy">
                Item
                <select
                  className="mt-2 w-full rounded-[16px] border border-border px-4 py-3 text-sm"
                  value={returnItemId}
                  onChange={(e) => setReturnItemId(e.target.value)}
                >
                  {order.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.sku} (qty {item.quantity})
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 block text-sm font-semibold text-navy">
                Quantity
                <Input
                  type="number"
                  min={1}
                  className="mt-2"
                  value={returnQty}
                  onChange={(e) => setReturnQty(Number(e.target.value) || 1)}
                />
              </label>
              <label className="mt-3 block text-sm font-semibold text-navy">
                Reason
                <Input
                  className="mt-2"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setShowReturn(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  type="button"
                  disabled={requestReturn.isPending}
                  onClick={() => void onReturn()}
                >
                  {requestReturn.isPending ? "Submitting…" : "Submit return"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </PageShell>
    </StoreChrome>
  );
}
