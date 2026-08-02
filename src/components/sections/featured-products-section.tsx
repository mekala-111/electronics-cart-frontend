"use client";

import { ProductRail } from "./product-rail";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useFeaturedProducts } from "@/hooks/use-catalog";
import { featuredProducts } from "@/lib/mock-data";
import { PageShell } from "@/components/layout/page-shell";

/** Flutter FeaturedProductsSection */
export function FeaturedProductsSection() {
  const { data, isLoading } = useFeaturedProducts();
  const products = data?.data ?? featuredProducts;

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
        eyebrow="TOP PICKS"
        title="Featured Products"
        accentWord="Products"
        subtitle="Handpicked new & refurbished laptops customers love."
        actionLabel="View All →"
        actionHref="/products"
        products={products}
      />
    </>
  );
}
