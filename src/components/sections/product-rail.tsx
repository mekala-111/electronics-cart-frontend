import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle, ViewAllLink } from "@/components/shared/section-title";
import { ProductCard } from "@/components/cards/product-card";
import type { Product } from "@/types";

function ProductRail({
  tone,
  eyebrow,
  title,
  accentWord,
  subtitle,
  actionLabel,
  actionHref,
  products,
  showTimer,
  footer,
}: {
  tone: "white" | "section";
  eyebrow: string;
  title: string;
  accentWord: string;
  subtitle: string;
  actionLabel: string;
  actionHref: string;
  products: Product[];
  showTimer?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <section className={tone === "white" ? "bg-white" : "relative bg-section"}>
      {tone === "section" && showTimer ? (
        <div className="pointer-events-none absolute right-0 top-0 h-[280px] w-[280px] rounded-full bg-hot/8 blur-3xl" />
      ) : null}
      <PageShell className="section-pad relative">
        <SectionTitle
          eyebrow={eyebrow}
          title={title}
          accentWord={accentWord}
          subtitle={subtitle}
          action={<ViewAllLink href={actionHref} label={actionLabel} />}
        />
        <div className="mt-10 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-[18px] xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} showTimer={showTimer} />
          ))}
        </div>
        {footer ? <div className="mt-8 flex justify-center">{footer}</div> : null}
      </PageShell>
    </section>
  );
}

export { ProductRail };
