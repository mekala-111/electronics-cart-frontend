import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = pageMetadata({
  title: "Checkout",
  description: "Complete your Electronics Cart order — address, delivery, and secure payment.",
  path: "/checkout",
});

export default function CheckoutPage() {
  return <CheckoutClient />;
}
