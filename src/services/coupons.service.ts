import { apiMutate } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { newIdempotencyKey } from "@/services/checkout.service";
import type {
  CouponApplyPayload,
  CouponApplyResult,
  CouponValidatePayload,
  CouponValidateResult,
} from "@/types/coupon";

export const couponsService = {
  validate: (body: CouponValidatePayload) =>
    apiMutate<CouponValidateResult>("post", endpoints.marketing.validateCoupon, body),

  apply: (body: CouponApplyPayload) =>
    apiMutate<CouponApplyResult>("post", endpoints.marketing.applyCoupon, body, {
      idempotencyKey: newIdempotencyKey(),
    }),
};
