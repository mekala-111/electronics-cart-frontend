import { apiGet, apiMutate } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { newIdempotencyKey } from "@/services/checkout.service";
import type {
  CreatePaymentPayload,
  PaymentHistoryPage,
  PaymentMethod,
  PaymentRecord,
  PaymentRefund,
} from "@/types/payment";

export const paymentsService = {
  methods: () => apiGet<PaymentMethod[]>(endpoints.payments.methods),

  create: (body: CreatePaymentPayload) =>
    apiMutate<PaymentRecord>("post", endpoints.payments.create, body, {
      idempotencyKey: newIdempotencyKey(),
    }),

  get: (paymentId: string) =>
    apiGet<PaymentRecord>(endpoints.payments.one(paymentId)),

  byOrder: (orderId: string) =>
    apiGet<PaymentRecord[]>(endpoints.payments.byOrder(orderId)),

  history: (params?: { page?: number; limit?: number }) =>
    apiGet<PaymentHistoryPage | PaymentRecord[]>(endpoints.payments.history, params),

  authorize: (paymentId: string) =>
    apiMutate<PaymentRecord>("post", endpoints.payments.authorize(paymentId), undefined, {
      idempotencyKey: newIdempotencyKey(),
    }),

  capture: (paymentId: string) =>
    apiMutate<PaymentRecord>("post", endpoints.payments.capture(paymentId), undefined, {
      idempotencyKey: newIdempotencyKey(),
    }),

  cancel: (paymentId: string) =>
    apiMutate<PaymentRecord>("post", endpoints.payments.cancel(paymentId), undefined, {
      idempotencyKey: newIdempotencyKey(),
    }),

  retry: (paymentId: string) =>
    apiMutate<PaymentRecord>("post", endpoints.payments.retry(paymentId), undefined, {
      idempotencyKey: newIdempotencyKey(),
    }),

  refunds: (paymentId: string) =>
    apiGet<PaymentRefund[]>(endpoints.payments.refunds(paymentId)),
};
