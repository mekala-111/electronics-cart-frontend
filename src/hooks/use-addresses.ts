"use client";

import { useMemo } from "react";
import { useQuery, type QueryClient } from "@tanstack/react-query";
import { addressesService } from "@/services/addresses.service";
import { queryKeys } from "@/hooks/query-keys";
import { tokenStorage } from "@/api/token-storage";
import { ApiError } from "@/types/api";
import {
  findAddressById,
  pickDefaultAddress,
  type CustomerAddress,
} from "@/types/address";
import { ADDRESS_CAPABILITIES } from "@/lib/address-capabilities";

function hasAccessToken() {
  return typeof window !== "undefined" && Boolean(tokenStorage.getAccess());
}

function addressesRetry(n: number, err: unknown) {
  if (err instanceof ApiError) {
    if (err.isUnauthorized || err.isForbidden || err.offline) return false;
    if (err.isNotFound || err.isValidation || err.isRateLimited) return false;
  }
  return n < 2;
}

/** Shared address list — Nest GET /addresses (recent order shipping addresses). */
export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: () => addressesService.list(),
    enabled: hasAccessToken(),
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
    retry: addressesRetry,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });
}

/**
 * Address by id from the cached list.
 * No GET /addresses/:id — returns undefined when id missing or list not loaded.
 */
export function useAddress(id: string | undefined | null) {
  const list = useAddresses();
  const address = useMemo(
    () => findAddressById(list.data, id),
    [list.data, id],
  );

  return {
    ...list,
    data: address as CustomerAddress | undefined,
    isDetailSupported: ADDRESS_CAPABILITIES.detail,
  };
}

/** First recent address from Nest list (no isDefault field / set-default API). */
export function useDefaultAddress() {
  const list = useAddresses();
  const address = useMemo(() => pickDefaultAddress(list.data), [list.data]);
  return {
    ...list,
    data: address,
    isSetDefaultSupported: ADDRESS_CAPABILITIES.setDefault,
  };
}

export async function prefetchAddresses(qc: QueryClient) {
  if (!hasAccessToken()) return;
  await qc.prefetchQuery({
    queryKey: queryKeys.addresses,
    queryFn: () => addressesService.list(),
    staleTime: 60_000,
  });
}

export { ADDRESS_CAPABILITIES } from "@/lib/address-capabilities";
