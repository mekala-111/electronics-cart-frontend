"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";
import { shippingService } from "@/services/shipping.service";
import { queryKeys } from "@/hooks/query-keys";
import { tokenStorage } from "@/api/token-storage";
import { ApiError } from "@/types/api";
import { getOriginPincode } from "@/lib/env";
import { SHIPPING_CAPABILITIES } from "@/lib/shipping-capabilities";

function hasAccessToken() {
  return typeof window !== "undefined" && Boolean(tokenStorage.getAccess());
}

function shippingRetry(n: number, err: unknown) {
  if (err instanceof ApiError) {
    if (err.isUnauthorized || err.isForbidden || err.offline) return false;
    if (err.status === 400 || err.isValidation || err.isNotFound) return false;
    if (err.isRateLimited) return false;
  }
  return n < 2;
}

export function useShippingMethods(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.shippingMethods,
    queryFn: () => shippingService.methods(),
    enabled: (opts?.enabled ?? true) && hasAccessToken(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: shippingRetry,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });
}

export function useShippingEstimate(opts: {
  toPincode?: string;
  weightKg?: number;
  cod?: boolean;
  declaredValue?: number;
  partnerId?: string;
  /** Included in query key so warehouse changes refetch (Nest estimate has no warehouseId). */
  warehouseId?: string;
  fromPincode?: string;
  enabled?: boolean;
}) {
  const toPincode = opts.toPincode?.trim() ?? "";
  const fromPincode = (opts.fromPincode ?? getOriginPincode()).trim();
  const weightKg = opts.weightKg ?? 1;
  const enabled =
    Boolean(opts.enabled ?? true) &&
    hasAccessToken() &&
    SHIPPING_CAPABILITIES.estimate &&
    toPincode.length >= 4 &&
    fromPincode.length >= 4;

  return useQuery({
    queryKey: queryKeys.shippingEstimate({
      fromPincode,
      toPincode,
      weightKg,
      cod: opts.cod,
      declaredValue: opts.declaredValue,
      partnerId: opts.partnerId,
      warehouseId: opts.warehouseId,
    }),
    queryFn: () =>
      shippingService.estimate({
        fromPincode,
        toPincode,
        weightKg,
        cod: opts.cod,
        declaredValue: opts.declaredValue,
        partnerId: opts.partnerId,
      }),
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: shippingRetry,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });
}

export function useDeliverySlots(enabled = false) {
  return useQuery({
    queryKey: queryKeys.deliverySlots,
    queryFn: () => shippingService.deliverySlots(),
    enabled: enabled && hasAccessToken() && SHIPPING_CAPABILITIES.deliverySlots,
    staleTime: 60_000,
    retry: shippingRetry,
    placeholderData: (prev) => prev,
  });
}

export function usePickupPoints(enabled = false) {
  return useQuery({
    queryKey: queryKeys.pickupPoints,
    queryFn: () => shippingService.pickupPoints(),
    enabled: enabled && hasAccessToken() && SHIPPING_CAPABILITIES.pickupPoints,
    staleTime: 5 * 60_000,
    retry: shippingRetry,
    placeholderData: (prev) => prev,
  });
}

export async function prefetchShippingMethods(qc: QueryClient) {
  if (!hasAccessToken()) return;
  await qc.prefetchQuery({
    queryKey: queryKeys.shippingMethods,
    queryFn: () => shippingService.methods(),
    staleTime: 5 * 60_000,
  });
}

export { SHIPPING_CAPABILITIES } from "@/lib/shipping-capabilities";
