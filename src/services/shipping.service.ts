import { apiGet, apiMutate } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  DeliverySlot,
  PickupPoint,
  ShippingEstimateInput,
  ShippingMethod,
  ShippingQuote,
} from "@/types/shipping";

type EstimateResponse =
  | ShippingQuote[]
  | { quotes: ShippingQuote[]; fromZone?: string; toZone?: string };

function unwrapQuotes(raw: EstimateResponse): ShippingQuote[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.quotes)) return raw.quotes;
  return [];
}

export const shippingService = {
  methods: () => apiGet<ShippingMethod[]>(endpoints.shipping.methods),

  estimate: async (body: ShippingEstimateInput) => {
    const raw = await apiMutate<EstimateResponse>(
      "post",
      endpoints.shipping.estimate,
      body,
    );
    return unwrapQuotes(raw);
  },

  rates: async (params?: {
    fromPincode?: string;
    toPincode?: string;
    weightKg?: number;
  }) => {
    const raw = await apiGet<EstimateResponse>(endpoints.shipping.rates, params);
    return unwrapQuotes(raw);
  },

  deliverySlots: () => apiGet<DeliverySlot[]>(endpoints.shipping.deliverySlots),

  pickupPoints: () => apiGet<PickupPoint[]>(endpoints.shipping.pickupPoints),

  tracking: (shipmentId: string) =>
    apiGet<unknown>(endpoints.shipping.tracking(shipmentId)),
};
