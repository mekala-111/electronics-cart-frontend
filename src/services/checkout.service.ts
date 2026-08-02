import { apiGet, apiMutate } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { tokenStorage } from "@/api/token-storage";
import { addressesService } from "@/services/addresses.service";
import { shippingService } from "@/services/shipping.service";
import { paymentsService } from "@/services/payments.service";
import type {
  CheckoutPayload,
  CheckoutResult,
  WarehouseDto,
} from "@/types/checkout";

export const checkoutService = {
  placeOrder: (body: CheckoutPayload, idempotencyKey: string) =>
    apiMutate<CheckoutResult>("post", endpoints.orders.checkout, body, {
      idempotencyKey,
    }),

  /** Shared with profile — Nest GET /addresses only */
  addresses: () => addressesService.list(),

  warehouses: () => apiGet<WarehouseDto[]>(endpoints.inventory.warehouses),

  /** @deprecated Prefer shippingService — kept for thin checkout facade */
  shippingMethods: () => shippingService.methods(),

  shippingEstimate: shippingService.estimate,

  paymentMethods: () => paymentsService.methods(),
};

export function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `chk_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function sessionKeyParam() {
  return tokenStorage.getSessionKey();
}
