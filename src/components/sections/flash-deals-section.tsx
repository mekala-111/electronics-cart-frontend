"use client";

import { ProductRail } from "./product-rail";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { PageShell } from "@/components/layout/page-shell";
import { useFlashDeals } from "@/hooks/use-catalog";
import { flashDeals } from "@/lib/mock-data";

/** Flutter FlashDealsSection */
export function FlashDealsSection() {
  const { data, isLoading } = useFlashDeals();
  const products = data?.data ?? flashDeals;

  if (isLoading && !data) {
    return (
      <PageShell className="section-pad bg-section">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-[18px] border border-border bg-white" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <>
      {data?.degraded ? (
        <PageShell className="bg-section pt-4">
          <LiveDataBanner show />
        </PageShell>
      ) : null}
      <ProductRail
        tone="section"
        eyebrow="LIMITED TIME"
        title="Flash Deals"
        accentWord="Deals"
        subtitle="Grab certified refurbished laptops before the timer runs out."
        actionLabel="View All Deals →"
        actionHref="/products?deal=flash"
        products={products}
        showTimer
      />
    </>
  );
}
