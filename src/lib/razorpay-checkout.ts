/** Razorpay Checkout.js helpers — open only for live gateway order ids. */

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
};

type RazorpayConstructor = new (options: RazorpayOptions) => { open: () => void };

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export function razorpayKeyId(): string | undefined {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  return key || undefined;
}

/** Live Razorpay order ids look like order_…; soft-launch mocks use order_mock_…. */
export function isLiveRazorpayOrderId(gatewayOrderId?: string | null): boolean {
  return Boolean(
    gatewayOrderId &&
      gatewayOrderId.startsWith("order_") &&
      !gatewayOrderId.startsWith("order_mock_"),
  );
}

export function needsRazorpayCheckout(gatewayOrderId?: string | null): boolean {
  return Boolean(razorpayKeyId() && isLiveRazorpayOrderId(gatewayOrderId));
}

function loadScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay requires a browser"));
  }
  if (window.Razorpay) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${SCRIPT_SRC}"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Razorpay script failed to load")),
        { once: true },
      );
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay script failed to load"));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(input: {
  gatewayOrderId: string;
  amountInr: number;
  currency?: string;
  description?: string;
  prefill?: RazorpayOptions["prefill"];
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
}): Promise<void> {
  const key = razorpayKeyId();
  if (!key) throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not set");

  await loadScript();
  if (!window.Razorpay) throw new Error("Razorpay SDK unavailable");

  const rzp = new window.Razorpay({
    key,
    amount: Math.round(input.amountInr * 100),
    currency: input.currency ?? "INR",
    name: "Electronics Cart",
    description: input.description,
    order_id: input.gatewayOrderId,
    prefill: input.prefill,
    handler: input.onSuccess,
    modal: { ondismiss: input.onDismiss },
    theme: { color: "#0B3A6E" },
  });
  rzp.open();
}
