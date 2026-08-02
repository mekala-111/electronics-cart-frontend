"use client";

import Link from "next/link";
import { ProductRail } from "./product-rail";
import { CtaButton } from "@/components/shared/cta-button";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { PageShell } from "@/components/layout/page-shell";
import { useRefurbishedProducts } from "@/hooks/use-catalog";
import { refurbishedProducts } from "@/lib/mock-data";

/** Flutter RefurbishedCollectionSection */
export function RefurbishedCollectionSection() {
  const { data, isLoading } = useRefurbishedProducts();
  const products = data?.data ?? refurbishedProducts;

  if (isLoading && !data) {
    return (
      <PageShell className="section-pad">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-[18px] border border-border bg-section" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <>
      {data?.degraded ? (
        <PageShell>
          <LiveDataBanner show className="mt-2" />
        </PageShell>
      ) : null}
      <ProductRail
        tone="white"
        eyebrow="CERTIFIED"
        title="Refurbished Collection"
        accentWord="Collection"
        subtitle="Quality-checked devices with warranty — smarter prices, zero compromise."
        actionLabel="Explore Refurbished →"
        actionHref="/products?condition=refurbished"
        products={products}
        footer={
          <Link href="/products?condition=refurbished">
            <CtaButton label="Shop Refurbished" variant="primary" showArrow />
          </Link>
        }
      />
    </>
  );
}
