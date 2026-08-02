/** Nest coupon validate / apply response shapes */

export type CouponValidatePayload = {
  code: string;
  cartTotal: number;
  brandIds?: string[];
  categoryIds?: string[];
  productIds?: string[];
};

export type CouponApplyPayload = CouponValidatePayload & {
  orderId?: string;
};

export type CouponValidateResult = {
  valid: boolean;
  couponId?: string;
  code?: string;
  discount?: number;
  reasons?: string[];
  errors?: unknown[];
  message?: string;
};

export type CouponApplyResult = {
  couponId?: string;
  code?: string;
  discount?: number;
  usageId?: string;
  valid?: boolean;
  reasons?: string[];
  message?: string;
};

/** Applied selection held in React Query cache (from validate/apply responses only). */
export type AppliedCoupon = {
  code: string;
  couponId?: string;
  discount: number;
  valid: true;
  source: "validate" | "apply";
};
