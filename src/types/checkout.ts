import type { CustomerAddress } from "@/types/address";

/** @deprecated Prefer CustomerAddress — same Nest GET /addresses shape */
export type CheckoutAddress = CustomerAddress;

export type CheckoutPayload = {
  cartId?: string;
  sessionKey?: string;
  warehouseId: string;
  shipping: {
    fullName: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country?: string;
    postalCode: string;
    gstin?: string;
  };
  billing?: CheckoutPayload["shipping"];
  giftCardCode?: string;
  walletAmount?: number;
};

export type OrderSummaryDto = {
  id: string;
  orderNumber?: string;
  status?: string;
  currency?: string;
  subtotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  shippingCharge?: number;
  grandTotal?: number;
  placedAt?: string | null;
  itemCount?: number;
};

export type CheckoutResult = {
  workflowId?: string;
  order: OrderSummaryDto | null;
  paymentId?: string | null;
  reservationIds?: string[];
  /** Module 8 prep */
  paymentRequired?: boolean;
};

export type PaymentMethodDto = {
  id: string;
  gatewayId?: string;
  code: string;
  name: string;
  status?: string;
};

export type WarehouseDto = {
  id: string;
  name: string;
  code: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status?: string;
};

export type { CouponValidateResult } from "@/types/coupon";
export type {
  ShippingMethod as ShippingMethodDto,
  ShippingQuote as ShippingQuoteDto,
} from "@/types/shipping";
export type { PaymentMethod as PaymentMethodOption, PaymentRecord } from "@/types/payment";
