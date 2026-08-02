"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsService } from "@/services/payments.service";
import { queryKeys } from "@/hooks/query-keys";
import { tokenStorage } from "@/api/token-storage";
import { ApiError } from "@/types/api";
import {
  PAYMENT_CAPABILITIES,
  PAYMENT_RETRYABLE_STATUSES,
  PAYMENT_SUCCESS_STATUSES,
} from "@/lib/payment-capabilities";
import type { CreatePaymentPayload, PaymentRecord } from "@/types/payment";

function hasAccessToken() {
  return typeof window !== "undefined" && Boolean(tokenStorage.getAccess());
}

function paymentsRetry(n: number, err: unknown) {
  if (err instanceof ApiError) {
    if (err.isUnauthorized || err.isForbidden || err.isNotFound || err.offline) return false;
    if (err.isValidation || err.isConflict || err.isRateLimited) return false;
  }
  return n < 2;
}

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

/** Payment history for the signed-in customer */
export function usePayments(opts?: { page?: number; limit?: number; enabled?: boolean }) {
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 20;
  return useQuery({
    queryKey: queryKeys.paymentsHistory({ page, limit }),
    queryFn: async () => {
      const raw = await paymentsService.history({ page, limit });
      if (Array.isArray(raw)) return raw;
      return raw.items ?? [];
    },
    enabled: (opts?.enabled ?? true) && hasAccessToken(),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: paymentsRetry,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });
}

export function usePaymentMethods(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.paymentMethods,
    queryFn: () => paymentsService.methods(),
    enabled: (opts?.enabled ?? true) && hasAccessToken() && PAYMENT_CAPABILITIES.methods,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: paymentsRetry,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });
}

export function usePayment(paymentId: string | undefined | null) {
  const id = paymentId?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.payment(id),
    queryFn: () => paymentsService.get(id),
    enabled: hasAccessToken() && isUuid(id),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: paymentsRetry,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return false;
      if (status === "captured") return false;
      if (
        status === "cancelled" ||
        status === "refunded" ||
        status === "expired" ||
        status === "partially_refunded" ||
        status === "chargeback"
      ) {
        return false;
      }
      // Poll while pending / processing / authorized (awaiting capture) / failed-awaiting-retry
      if (
        status === "pending" ||
        status === "processing" ||
        status === "authorized" ||
        status === "failed"
      ) {
        return 4_000;
      }
      return false;
    },
  });
}

export function useOrderPayments(orderId: string | undefined | null) {
  const id = orderId?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.orderPayments(id),
    queryFn: () => paymentsService.byOrder(id),
    enabled: hasAccessToken() && isUuid(id),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: paymentsRetry,
    placeholderData: (prev) => prev,
  });
}

export function usePaymentRefunds(paymentId: string | undefined | null) {
  const id = paymentId?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.paymentRefunds(id),
    queryFn: () => paymentsService.refunds(id),
    enabled: hasAccessToken() && isUuid(id) && PAYMENT_CAPABILITIES.refunds,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: paymentsRetry,
    placeholderData: (prev) => prev,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentsService.create(payload),
    onSuccess: (payment) => {
      qc.setQueryData(queryKeys.payment(payment.id), payment);
      void qc.invalidateQueries({ queryKey: queryKeys.orderPayments(payment.orderId) });
      void qc.invalidateQueries({ queryKey: ["payments", "history"] });
    },
  });
}

/**
 * Completes / confirms payment via Nest only.
 * Flow: GET status → if pending, authorize → if authorized, capture → return final GET.
 * Never treats browser/gateway UI callbacks as success.
 */
export function usePaymentVerification() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string): Promise<PaymentRecord> => {
      let payment = await paymentsService.get(paymentId);

      if (PAYMENT_SUCCESS_STATUSES.has(payment.status) || payment.status === "captured") {
        return payment;
      }

      if (payment.status === "pending") {
        payment = await paymentsService.authorize(paymentId);
      }

      if (payment.status === "authorized") {
        payment = await paymentsService.capture(paymentId);
      }

      // Final authoritative read
      return paymentsService.get(paymentId);
    },
    onSuccess: (payment) => {
      qc.setQueryData(queryKeys.payment(payment.id), payment);
      void qc.invalidateQueries({ queryKey: queryKeys.orderPayments(payment.orderId) });
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
      void qc.invalidateQueries({ queryKey: queryKeys.order(payment.orderId) });
    },
  });
}

export function useRetryPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => paymentsService.retry(paymentId),
    onSuccess: (payment) => {
      qc.setQueryData(queryKeys.payment(payment.id), payment);
      void qc.invalidateQueries({ queryKey: queryKeys.orderPayments(payment.orderId) });
      void qc.invalidateQueries({ queryKey: queryKeys.payment(payment.id) });
    },
  });
}

export function useCancelPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => paymentsService.cancel(paymentId),
    onSuccess: (payment) => {
      qc.setQueryData(queryKeys.payment(payment.id), payment);
      void qc.invalidateQueries({ queryKey: queryKeys.orderPayments(payment.orderId) });
    },
  });
}

export function isPaymentSuccessful(status?: string | null) {
  return Boolean(status && PAYMENT_SUCCESS_STATUSES.has(status));
}

export function isPaymentRetryable(status?: string | null) {
  return Boolean(status && PAYMENT_RETRYABLE_STATUSES.has(status));
}

export { PAYMENT_CAPABILITIES } from "@/lib/payment-capabilities";
