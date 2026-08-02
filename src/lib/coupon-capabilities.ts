/**
 * Coupon API capabilities for Nest marketing module (customer routes).
 * Keep in sync with POST /coupons/validate and POST /coupons/apply only.
 */
export const COUPON_CAPABILITIES = {
  validate: true,
  apply: true,
  /** No DELETE /coupons or unapply — clear client validation cache only */
  remove: false,
  listAvailable: false,
  details: false,
  automaticPromotions: false,
  /** CheckoutDto has no couponCode — apply attaches after order creation */
  checkoutInline: false,
} as const;

export type CouponCapability = keyof typeof COUPON_CAPABILITIES;

export function couponCapabilityEnabled(key: CouponCapability): boolean {
  return COUPON_CAPABILITIES[key];
}

export const COUPON_CAPABILITY_MESSAGE =
  "Coupons are validated by the server. Removal clears your selection only — Nest has no unapply endpoint. Checkout attaches a coupon after the order is created.";
