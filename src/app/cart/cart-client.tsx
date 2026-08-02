"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { StoreChrome } from "@/components/layout/store-chrome";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle } from "@/components/shared/section-title";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProductCard } from "@/components/cards/product-card";
import { CtaButton } from "@/components/shared/cta-button";
import { Input } from "@/components/ui/input";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { QueryState } from "@/components/shared/query-state";
import { formatInr } from "@/lib/utils";
import { featuredProducts } from "@/lib/mock-data";
import { useFeaturedProducts } from "@/hooks/use-catalog";
import {
  formatCouponFailure,
  useAppliedCoupon,
  useCouponValidation,
  useRemoveCoupon,
} from "@/hooks/use-coupons";
import {
  useCartLines,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/use-cart";
import { useToast } from "@/components/shared/toast";
import { SafeImage } from "@/components/shared/safe-image";
import { describeApiError, ApiError } from "@/types/api";
import { COUPON_CAPABILITY_MESSAGE } from "@/lib/coupon-capabilities";

export default function CartClient() {
  const cart = useCartLines();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const items = cart.lines;
  const subtotal = cart.subtotal;
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const validateCoupon = useCouponValidation();
  const removeCoupon = useRemoveCoupon();
  const applied = useAppliedCoupon();
  const discount = applied.data?.discount ?? 0;
  const appliedCode = applied.data?.code;
  const recs = useFeaturedProducts();
  const toast = useToast();
  const recommendations = recs.data?.data ?? featuredProducts;
  const gst = Math.round(subtotal * 0.18);
  // Shipping charge is Nest-only (checkout estimate). Cart does not invent delivery fees.
  const total = Math.max(0, subtotal + gst - discount);

  return (
    <StoreChrome>
      <PageShell className="section-pad">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
        <SectionTitle title="Shopping Cart" accentWord="Cart" />

        <QueryState
          className="mt-8"
          isLoading={cart.isLoading && !cart.data}
          isFetching={cart.isFetching}
          isError={cart.isError}
          error={cart.error}
          onRetry={() => void cart.refetch()}
          skeleton={
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-[24px] border border-border bg-section"
                  />
                ))}
              </div>
              <div className="h-64 animate-pulse rounded-[24px] border border-border bg-section" />
            </div>
          }
          isEmpty={!cart.isLoading && !cart.isError && items.length === 0}
          emptyTitle="Your cart is empty."
          emptyDescription="Browse products and add devices to get started."
        >
          {items.length === 0 ? (
            <div className="mt-2 text-center">
              <Link href="/products" className="inline-block">
                <CtaButton label="Browse Products" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-[24px] border border-border bg-white p-4 shadow-[0_8px_16px_rgba(8,21,47,0.06)]"
                  >
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={90}
                      className="h-24 w-28 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-bold text-navy hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted">{item.specs}</p>
                      <p className="mt-2 font-extrabold text-navy">
                        {formatInr(item.unitPrice)}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-xl border border-border">
                          <button
                            type="button"
                            className="p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            aria-label="Decrease quantity"
                            disabled={updateItem.isPending}
                            onClick={() => {
                              updateItem.mutate(
                                { itemId: item.id, quantity: item.quantity - 1 },
                                {
                                  onError: (err) => {
                                    toast.error(
                                      "Update failed",
                                      err instanceof ApiError ? err.message : "Try again",
                                    );
                                  },
                                },
                              );
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            aria-label="Increase quantity"
                            disabled={updateItem.isPending}
                            onClick={() => {
                              updateItem.mutate(
                                { itemId: item.id, quantity: item.quantity + 1 },
                                {
                                  onError: (err) => {
                                    toast.error(
                                      "Update failed",
                                      err instanceof ApiError ? err.message : "Try again",
                                    );
                                  },
                                },
                              );
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={removeItem.isPending}
                          onClick={() => {
                            removeItem.mutate(item.id, {
                              onSuccess: () => toast.info("Removed from cart", item.name),
                              onError: (err) => {
                                toast.error(
                                  "Remove failed",
                                  err instanceof ApiError ? err.message : "Try again",
                                );
                              },
                            });
                          }}
                          className="text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="h-fit rounded-[24px] border border-border bg-white p-6 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
                <h2 className="text-lg font-bold text-navy">Price Summary</h2>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-semibold">{formatInr(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Shipping</span>
                    <span className="font-semibold text-muted">At checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">GST (18%)</span>
                    <span className="font-semibold">{formatInr(gst)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base">
                    <span className="font-bold text-navy">Total</span>
                    <span className="font-extrabold text-primary">{formatInr(total)}</span>
                  </div>
                </div>
                {appliedCode && discount > 0 ? (
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted">Coupon ({appliedCode})</span>
                    <span className="font-semibold text-accent">-{formatInr(discount)}</span>
                  </div>
                ) : null}
                <div className="mt-5 flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    aria-label="Coupon code"
                    value={appliedCode ?? coupon}
                    disabled={Boolean(appliedCode)}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  {appliedCode ? (
                    <button
                      type="button"
                      className="rounded-[16px] border border-border px-4 text-sm font-semibold text-navy hover:border-primary hover:text-primary"
                      disabled={removeCoupon.isPending}
                      onClick={() => {
                        void removeCoupon.mutateAsync().then(() => {
                          setCoupon("");
                          setCouponMsg("Coupon cleared (server has no unapply endpoint)");
                        });
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rounded-[16px] border border-border px-4 text-sm font-semibold text-navy hover:border-primary hover:text-primary"
                      disabled={validateCoupon.isPending}
                      onClick={async () => {
                        try {
                          const payload = await validateCoupon.mutateAsync({
                            code: coupon,
                            cartTotal: subtotal,
                          });
                          if (!payload.valid) {
                            setCouponMsg(formatCouponFailure(payload));
                            toast.error("Invalid coupon", formatCouponFailure(payload));
                            return;
                          }
                          setCouponMsg(
                            payload.code ? `${payload.code} validated` : "Coupon validated",
                          );
                          toast.success("Coupon validated", "Discount from server");
                        } catch (err) {
                          setCouponMsg(describeApiError(err, "Coupon unavailable"));
                          toast.error("Coupon failed", describeApiError(err));
                        }
                      }}
                    >
                      {validateCoupon.isPending ? "…" : "Apply"}
                    </button>
                  )}
                </div>
                {couponMsg ? <p className="mt-2 text-xs text-muted">{couponMsg}</p> : null}
                <p className="mt-2 text-xs text-muted">{COUPON_CAPABILITY_MESSAGE}</p>
                <Link href="/checkout" className="mt-5 block">
                  <CtaButton label="Proceed to Checkout" className="w-full" />
                </Link>
              </aside>
            </div>
          )}
        </QueryState>

        <div className="mt-14">
          <SectionTitle title="You may also like" accentWord="like" />
          <LiveDataBanner show={recs.data?.degraded} className="mt-2" />
          <div className="mt-8 grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </PageShell>
    </StoreChrome>
  );
}
