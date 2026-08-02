import { apiGet, apiMutate } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { newIdempotencyKey } from "@/services/checkout.service";
import { paymentsService } from "@/services/payments.service";
import type {
  CancelOrderPayload,
  CancelOrderResult,
  CancellationReason,
  OrderDetail,
  OrderSummary,
  ReturnRequestPayload,
} from "@/types/orders";

function mapCancellationReason(raw: Record<string, unknown>): CancellationReason {
  return {
    id: String(raw.id),
    code: raw.code != null ? String(raw.code) : undefined,
    label: String(raw.label ?? raw.code ?? "Reason"),
    status: raw.status != null ? String(raw.status) : undefined,
  };
}

export const customerOrdersService = {
  history: () => apiGet<OrderSummary[]>(endpoints.orders.list),

  detail: (idOrNumber: string) =>
    apiGet<OrderDetail>(endpoints.orders.one(idOrNumber)),

  cancel: (orderId: string, body: CancelOrderPayload) =>
    apiMutate<CancelOrderResult>("post", endpoints.orders.cancel(orderId), body, {
      idempotencyKey: newIdempotencyKey(),
    }),

  requestReturn: (orderId: string, body: ReturnRequestPayload) =>
    apiMutate<unknown>("post", endpoints.orders.returns(orderId), body, {
      idempotencyKey: newIdempotencyKey(),
    }),

  requestExchange: (
    orderId: string,
    body: {
      orderItemId: string;
      exchangeType: string;
      toVariantId?: string;
      reason?: string;
    },
  ) =>
    apiMutate<unknown>("post", endpoints.orders.exchanges(orderId), body, {
      idempotencyKey: newIdempotencyKey(),
    }),

  cancellationReasons: async () => {
    const rows = await apiGet<Record<string, unknown>[]>(
      endpoints.orders.cancellationReasons,
    );
    return (rows ?? []).map(mapCancellationReason);
  },

  paymentsForOrder: (orderId: string) => paymentsService.byOrder(orderId),

  refundsForPayment: (paymentId: string) => paymentsService.refunds(paymentId),
};
