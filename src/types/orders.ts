/** Nest order shapes (orders.mapper + getOrder / history) */

export type OrderSummary = {
  id: string;
  orderNumber?: string;
  status: string;
  currency?: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCharge: number;
  grandTotal: number;
  placedAt?: string | null;
  cancelledAt?: string | null;
  itemCount?: number;
};

export type OrderLine = {
  id: string;
  variantId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderAddress = {
  id: string;
  type: string;
  fullName: string;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country?: string | null;
  postalCode: string;
};

export type OrderStatusEvent = {
  from?: string | null;
  to: string;
  note?: string | null;
  changedAt?: string | null;
};

export type OrderDetail = OrderSummary & {
  items: OrderLine[];
  addresses: OrderAddress[];
  statusHistory: OrderStatusEvent[];
};

export type CancellationReason = {
  id: string;
  code?: string;
  label: string;
  status?: string;
};

export type CancelOrderPayload = {
  cancellationReasonId?: string;
  note?: string;
};

export type ReturnRequestPayload = {
  orderItemId: string;
  quantity: number;
  reason?: string;
};

export type CancelOrderResult = {
  id: string;
  status: string;
};

export type { PaymentRecord as OrderPayment, PaymentRefund } from "@/types/payment";

/** Statuses Nest allows for customer cancel */
export const CANCELABLE_STATUSES = new Set(["pending", "confirmed"]);

/** Statuses Nest allows for return request */
export const RETURNABLE_STATUSES = new Set(["delivered", "completed", "shipped"]);
