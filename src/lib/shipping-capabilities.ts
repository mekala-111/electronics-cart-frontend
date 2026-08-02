/**
 * Shipping API capabilities for Nest shipping module (customer routes).
 * Keep in sync with GET/POST under /shipping.
 */
export const SHIPPING_CAPABILITIES = {
  methods: true,
  estimate: true,
  ratesList: true,
  deliverySlots: true,
  pickupPoints: true,
  shipmentTracking: true,
  /** CheckoutDto has no shippingMethodId / rateId — selection is informational */
  checkoutMethodBinding: false,
  /** Estimate DTO has no warehouseId — warehouse change triggers refetch only */
  warehouseScopedRates: false,
  /** Methods mapper has no ETA fields — ETA only via estimate quotes / shipment */
  methodLevelEta: false,
} as const;

export type ShippingCapability = keyof typeof SHIPPING_CAPABILITIES;

export function shippingCapabilityEnabled(key: ShippingCapability): boolean {
  return SHIPPING_CAPABILITIES[key];
}

export const SHIPPING_CAPABILITY_MESSAGE =
  "Delivery charges come from the server estimate. The selected method is informational until Nest Checkout accepts a shipping method id.";
