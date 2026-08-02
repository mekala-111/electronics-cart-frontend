/** Nest payment mapper shapes (payments.mapper) */

export type PaymentMethod = {
  id: string;
  gatewayId?: string;
  code: string;
  name: string;
  status?: string;
};

export type PaymentRecord = {
  id: string;
  orderId: string;
  customerId?: string | null;
  gatewayId?: string | null;
  gatewayCode?: string | null;
  paymentMethodId?: string | null;
  amount: number;
  currency?: string;
  refundedAmount?: number;
  status: string;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  authorizedAt?: string | null;
  capturedAt?: string | null;
  failedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreatePaymentPayload = {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethodId?: string;
  savedPaymentMethodId?: string;
};

export type PaymentRefund = {
  id: string;
  refundNumber?: string;
  paymentId: string;
  orderId?: string | null;
  amount: number;
  currency?: string;
  status: string;
  reason?: string | null;
  processedAt?: string | null;
  createdAt?: string | null;
};

export type PaymentHistoryPage = {
  items: PaymentRecord[];
  total?: number;
  page?: number;
  limit?: number;
};
