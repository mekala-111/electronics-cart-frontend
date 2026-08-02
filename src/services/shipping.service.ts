import { apiGet, apiMutate } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  DeliverySlot,
  PickupPoint,
  ShippingEstimateInput,
  ShippingMethod,
  ShippingQuote,
} from "@/types/shipping";

export const shippingService = {
  methods: () => apiGet<ShippingMethod[]>(endpoints.shipping.methods),

  estimate: (body: ShippingEstimateInput) =>
    apiMutate<ShippingQuote[]>("post", endpoints.shipping.estimate, body),

  rates: (params?: { fromPincode?: string; toPincode?: string; weightKg?: number }) =>
    apiGet<ShippingQuote[]>(endpoints.shipping.rates, params),

  deliverySlots: () => apiGet<DeliverySlot[]>(endpoints.shipping.deliverySlots),

  pickupPoints: () => apiGet<PickupPoint[]>(endpoints.shipping.pickupPoints),

  tracking: (shipmentId: string) =>
    apiGet<unknown>(endpoints.shipping.tracking(shipmentId)),
};
