"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle, ViewAllLink } from "@/components/shared/section-title";
import { BrandCard } from "@/components/cards/brand-card";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useBrands } from "@/hooks/use-catalog";
import { brands as mockBrands } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const CARD_W = 148;
const GAP = 18;

/** Flutter FeaturedBrandsSection + Figma carousel — API with mock fallback */
export function FeaturedBrandsSection() {
  const { data } = useBrands();
  const brands = data?.data ?? mockBrands;
  const degraded = data?.degraded;

  const scroller = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(8);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const usable = el.clientWidth;
    setPerPage(Math.max(1, Math.floor((usable + GAP) / (CARD_W + GAP))));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const maxPage = Math.max(0, Math.ceil(brands.length / perPage) - 1);

  const go = (next: number) => {
    const p = Math.min(maxPage, Math.max(0, next));
    setPage(p);
    scroller.current?.scrollTo({
      left: p * perPage * (CARD_W + GAP),
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-section">
      <div className="pointer-events-none absolute -left-10 top-5 h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-6 top-10 h-[280px] w-[280px] rounded-full bg-accent/10 blur-3xl" />

      <PageShell className="section-pad relative">
        <SectionTitle
          eyebrow="OUR PARTNERS"
          title="Featured Brands"
          accentWord="Brands"
          subtitle="Authorized & Certified Electronics from Trusted Global Brands"
          action={<ViewAllLink href="/products?tab=brands" label="View All →" />}
        />
        <LiveDataBanner show={degraded} className="mt-4" />

        <div className="relative mt-10">
          <button
            type="button"
            onClick={() => go(page - 1)}
            disabled={page <= 0}
            aria-label="Previous brands"
            className={cn(
              "absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_6px_16px_rgba(8,21,47,0.1)] transition xl:flex",
              "hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-35",
            )}
          >
            <ChevronLeft className="h-[26px] w-[26px]" />
          </button>

          <div
            ref={scroller}
            className="flex gap-[18px] overflow-x-auto scroll-smooth px-0 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] xl:mx-[52px] [&::-webkit-scrollbar]:hidden"
          >
            {brands.map((b) => (
              <BrandCard key={b.name} brand={b} width={CARD_W} height={152} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(page + 1)}
            disabled={page >= maxPage}
            aria-label="Next brands"
            className={cn(
              "absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_6px_16px_rgba(8,21,47,0.1)] transition xl:flex",
              "hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-35",
            )}
          >
            <ChevronRight className="h-[26px] w-[26px]" />
          </button>
        </div>

        <div className="mt-7 flex justify-center gap-2" role="tablist" aria-label="Brand pages">
          {Array.from({ length: maxPage + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={page === i}
              aria-label={`Page ${i + 1}`}
              onClick={() => go(i)}
              className={cn(
                "h-2 rounded-lg transition",
                page === i ? "w-7 bg-primary" : "w-2 bg-border",
              )}
            />
          ))}
        </div>
      </PageShell>

      <div className="h-10" />
      <div className="h-px bg-divider" />
    </section>
  );
}
