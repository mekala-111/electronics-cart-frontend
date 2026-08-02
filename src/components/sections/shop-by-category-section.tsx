"use client";

import Image from "next/image";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle, ViewAllLink } from "@/components/shared/section-title";
import { CategoryCard } from "@/components/cards/category-card";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useCategories } from "@/hooks/use-catalog";
import { categories as mockCategories } from "@/lib/mock-data";

/** Flutter ShopByCategorySection — API with mock fallback */
export function ShopByCategorySection() {
  const { data } = useCategories();
  const categories = data?.data ?? mockCategories;

  return (
    <section className="relative bg-category-bg">
      <Image
        src="/images/featurebg.png"
        alt=""
        fill
        className="object-cover object-top opacity-90"
      />
      <div className="pointer-events-none absolute left-0 top-2.5 h-90 w-90 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-[30px] h-80 w-80 rounded-full bg-accent/12 blur-3xl" />
      <PageShell className="section-pad relative">
        <SectionTitle
          title="Shop by Category"
          accentWord="Category"
          subtitle="Explore a wide range of products across all electronics categories."
          action={<ViewAllLink href="/products" label="View All Categories →" />}
        />
        <LiveDataBanner show={data?.degraded} className="mt-4" />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-[18px] xl:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c.title} category={c} />
          ))}
        </div>
      </PageShell>
    </section>
  );
}
