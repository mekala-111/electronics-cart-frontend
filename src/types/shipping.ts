/** Nest shipping mapper / estimate shapes */

export type ShippingMethod = {
  id: string;
  partnerId?: string | null;
  code: string;
  name: string;
  serviceType?: string | null;
  isCodSupported?: boolean;
  status?: string;
};

export type ShippingQuote = {
  rateId: string;
  partnerId?: string;
  partnerCode?: string;
  serviceId?: string;
  serviceName?: string;
  currency?: string;
  total: number;
  baseRate?: number;
  perKgRate?: number;
  codFee?: number;
  insurance?: number;
  fromZone?: string;
  toZone?: string;
};

export type ShippingEstimateInput = {
  fromPincode: string;
  toPincode: string;
  weightKg: number;
  cod?: boolean;
  declaredValue?: number;
  partnerId?: string;
};

export type DeliverySlot = {
  id: string;
  shipmentId?: string | null;
  slotStart?: string | null;
  slotEnd?: string | null;
  isConfirmed?: boolean;
};

export type PickupPoint = {
  id: string;
  code: string;
  name: string;
  city?: string | null;
  postalCode?: string | null;
  pointType?: string | null;
  status?: string;
};
