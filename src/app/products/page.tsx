import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import ProductsClient from "./products-client";

export const metadata: Metadata = pageMetadata({
  title: "Shop Products",
  description: "Browse certified new & refurbished laptops, desktops, and accessories.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-muted">Loading catalog…</div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
