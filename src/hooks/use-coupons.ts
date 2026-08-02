"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponsService } from "@/services/coupons.service";
import { queryKeys } from "@/hooks/query-keys";
import { ApiError } from "@/types/api";
import { COUPON_CAPABILITIES } from "@/lib/coupon-capabilities";
import type {
  AppliedCoupon,
  CouponApplyPayload,
  CouponValidatePayload,
  CouponValidateResult,
} from "@/types/coupon";

/**
 * Available / browsable coupons.
 * Nest has no customer list endpoint — query stays disabled.
 */
export function useCoupons() {
  return useQuery({
    queryKey: queryKeys.couponsAvailable,
    queryFn: async (): Promise<never[]> => {
      throw new ApiError({
        message: "Available coupons endpoint is not available",
        code: "NOT_IMPLEMENTED",
        status: 501,
      });
    },
    enabled: COUPON_CAPABILITIES.listAvailable,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
  });
}

/** Applied coupon from last successful validate/apply — React Query only, never local math. */
export function useAppliedCoupon() {
  return useQuery({
    queryKey: queryKeys.couponApplied,
    queryFn: async (): Promise<AppliedCoupon | null> => null,
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: null,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useCouponValidation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CouponValidatePayload) => couponsService.validate(payload),
    onSuccess: (result) => {
      if (result.valid && result.code) {
        const applied: AppliedCoupon = {
          code: result.code,
          couponId: result.couponId,
          discount: result.discount ?? 0,
          valid: true,
          source: "validate",
        };
        qc.setQueryData(queryKeys.couponApplied, applied);
      } else {
        qc.setQueryData(queryKeys.couponApplied, null);
      }
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

/** @deprecated Prefer useCouponValidation */
export function useValidateCoupon() {
  return useCouponValidation();
}

export function useApplyCoupon() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CouponApplyPayload) => couponsService.apply(payload),
    onSuccess: (result, vars) => {
      if (result.couponId || result.code || vars.code) {
        const prev = qc.getQueryData<AppliedCoupon | null>(queryKeys.couponApplied);
        qc.setQueryData(queryKeys.couponApplied, {
          code: result.code ?? vars.code,
          couponId: result.couponId ?? prev?.couponId,
          discount: result.discount ?? prev?.discount ?? 0,
          valid: true as const,
          source: "apply" as const,
        } satisfies AppliedCoupon);
      }
      if (vars.orderId) {
        void qc.invalidateQueries({ queryKey: queryKeys.order(vars.orderId) });
      }
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

/**
 * Clears validated coupon selection.
 * Nest has no remove/unapply endpoint — does not call the API.
 */
export function useRemoveCoupon() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (COUPON_CAPABILITIES.remove) {
        throw new ApiError({
          message: "Coupon remove endpoint is not wired",
          code: "NOT_IMPLEMENTED",
          status: 501,
        });
      }
      return null;
    },
    onSuccess: () => {
      qc.setQueryData(queryKeys.couponApplied, null);
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function formatCouponFailure(result: CouponValidateResult): string {
  if (result.reasons?.length) return result.reasons.join("; ");
  if (result.message) return result.message;
  return "Coupon not eligible";
}

export { COUPON_CAPABILITIES } from "@/lib/coupon-capabilities";
