"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkoutService, newIdempotencyKey, sessionKeyParam } from "@/services/checkout.service";
import { queryKeys } from "@/hooks/query-keys";
import { tokenStorage } from "@/api/token-storage";
import { ApiError } from "@/types/api";
import type { CheckoutPayload, CheckoutResult } from "@/types/checkout";

function hasAccessToken() {
  return typeof window !== "undefined" && Boolean(tokenStorage.getAccess());
}

export function useWarehouses() {
  return useQuery({
    queryKey: queryKeys.warehouses,
    queryFn: () => checkoutService.warehouses(),
    enabled: hasAccessToken(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });
}

/**
 * Places order via POST /checkout.
 * Never optimistic — confirmation only after backend success.
 */
export function usePlaceOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CheckoutPayload): Promise<CheckoutResult> => {
      const key = newIdempotencyKey();
      const body: CheckoutPayload = {
        ...payload,
        sessionKey: payload.sessionKey ?? sessionKeyParam(),
      };
      const result = await checkoutService.placeOrder(body, key);
      if (!result?.order?.id && !result?.order?.orderNumber) {
        throw new ApiError({
          message: "Checkout completed without an order reference",
          code: "INVALID_CHECKOUT_RESPONSE",
          status: 502,
        });
      }
      return {
        ...result,
        paymentRequired: Boolean(result.paymentId),
      };
    },
    onSuccess: async (result) => {
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
      void qc.invalidateQueries({ queryKey: queryKeys.addresses });
      if (result.paymentId) {
        void qc.invalidateQueries({ queryKey: queryKeys.payment(result.paymentId) });
        if (result.order?.id) {
          void qc.invalidateQueries({
            queryKey: queryKeys.orderPayments(result.order.id),
          });
        }
      }
    },
  });
}

/** @deprecated Prefer usePlaceOrder — alias for architecture naming */
export function useCheckout() {
  return usePlaceOrder();
}
