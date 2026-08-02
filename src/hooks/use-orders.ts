"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { customerOrdersService } from "@/services/orders.service";
import { queryKeys } from "@/hooks/query-keys";
import { tokenStorage } from "@/api/token-storage";
import { ApiError } from "@/types/api";
import type {
  CancelOrderPayload,
  OrderDetail,
  OrderSummary,
  ReturnRequestPayload,
} from "@/types/orders";

function hasAccessToken() {
  return typeof window !== "undefined" && Boolean(tokenStorage.getAccess());
}

function ordersRetry(n: number, err: unknown) {
  if (err instanceof ApiError) {
    if (err.isUnauthorized || err.isForbidden || err.isNotFound || err.offline) return false;
    if (err.isValidation || err.isConflict || err.isRateLimited) return false;
  }
  return n < 2;
}

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => customerOrdersService.history(),
    enabled: hasAccessToken(),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: ordersRetry,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });
}

export function useOrder(idOrNumber: string | undefined | null) {
  const key = idOrNumber?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.order(key),
    queryFn: () => customerOrdersService.detail(key),
    enabled: hasAccessToken() && key.length > 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: ordersRetry,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });
}

export function useCancellationReasons(enabled = true) {
  return useQuery({
    queryKey: queryKeys.cancellationReasons,
    queryFn: () => customerOrdersService.cancellationReasons(),
    enabled: hasAccessToken() && enabled,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    retry: ordersRetry,
    placeholderData: (prev) => prev,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { orderId: string; body?: CancelOrderPayload }) =>
      customerOrdersService.cancel(vars.orderId, vars.body ?? {}),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: queryKeys.orders });
      const previous = qc.getQueryData<OrderSummary[]>(queryKeys.orders);
      if (previous) {
        qc.setQueryData<OrderSummary[]>(
          queryKeys.orders,
          previous.map((o) =>
            o.id === vars.orderId ? { ...o, status: "cancelled" } : o,
          ),
        );
      }
      const detailKey = queryKeys.order(vars.orderId);
      const prevDetail = qc.getQueryData<OrderDetail>(detailKey);
      if (prevDetail) {
        qc.setQueryData<OrderDetail>(detailKey, {
          ...prevDetail,
          status: "cancelled",
        });
      }
      return { previous, prevDetail, orderId: vars.orderId };
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.orders, ctx.previous);
      if (ctx?.prevDetail) {
        qc.setQueryData(queryKeys.order(vars.orderId), ctx.prevDetail);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useRequestReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { orderId: string; body: ReturnRequestPayload }) =>
      customerOrdersService.requestReturn(vars.orderId, vars.body),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export async function prefetchOrder(qc: QueryClient, idOrNumber: string) {
  const key = idOrNumber.trim();
  if (!key || !hasAccessToken()) return;
  await qc.prefetchQuery({
    queryKey: queryKeys.order(key),
    queryFn: () => customerOrdersService.detail(key),
    staleTime: 30_000,
  });
}

export function formatOrderDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatOrderDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
