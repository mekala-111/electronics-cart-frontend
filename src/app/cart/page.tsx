import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import CartClient from "./cart-client";

export const metadata: Metadata = pageMetadata({
  title: "Shopping Cart",
  description: "Review your Electronics Cart items, apply coupons, and checkout securely.",
  path: "/cart",
});

export default function CartPage() {
  return <CartClient />;
}
