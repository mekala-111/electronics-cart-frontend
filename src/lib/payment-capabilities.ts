/**
 * Payment API capabilities for Nest payments module (customer routes).
 * Webhooks are server-side only — never called from the storefront.
 */
export const PAYMENT_CAPABILITIES = {
  methods: true,
  create: true,
  getStatus: true,
  history: true,
  authorize: true,
  capture: true,
  cancel: true,
  retry: true,
  refunds: true,
  /** Customer POST /payments/:id/refund exists — storefront displays only */
  createRefund: false,
  byOrder: true,
  savedMethods: true,
  /** No dedicated POST /payments/:id/verify — status via GET + authorize/capture */
  dedicatedVerify: false,
  /** Nest create returns mapPayment — no clientSecret / redirectUrl fields */
  hostedRedirect: false,
  clientSecret: false,
  /** Razorpay Checkout.js when NEXT_PUBLIC_RAZORPAY_KEY_ID + live gateway order */
  embeddedSdk: true,
  /** CheckoutDto has no paymentMethodId — method selection is UI/estimate only */
  checkoutPaymentMethodId: false,
} as const;

export type PaymentCapability = keyof typeof PAYMENT_CAPABILITIES;

export function paymentCapabilityEnabled(key: PaymentCapability): boolean {
  return PAYMENT_CAPABILITIES[key];
}

export const PAYMENT_CAPABILITY_MESSAGE =
  "Payment status comes from the server. Soft-launch may settle in checkout; live checkout opens Razorpay, then Nest authorize/capture confirms — never trust the browser alone.";

/** Treated as paid for confirmation UI — Nest is still authoritative. */
export const PAYMENT_SUCCESS_STATUSES = new Set([
  "captured",
  "authorized",
]);

export const PAYMENT_RETRYABLE_STATUSES = new Set(["pending", "failed"]);

/** Statuses Nest may return (display-only; never invent). */
export const PAYMENT_KNOWN_STATUSES = [
  "pending",
  "processing",
  "authorized",
  "captured",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded",
  "expired",
  "chargeback",
] as const;
