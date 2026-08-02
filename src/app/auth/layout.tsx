import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Sign In",
  description: "Sign in to Electronics Cart to track orders, wishlist, and warranty.",
  path: "/auth/login",
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
