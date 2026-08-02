import { Star } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle } from "@/components/shared/section-title";
import { reviews } from "@/lib/mock-data";

/** Flutter CustomerReviewsSection */
export function CustomerReviewsSection() {
  return (
    <section className="bg-white">
      <PageShell className="section-pad">
        <SectionTitle
          eyebrow="SOCIAL PROOF"
          title="Customer Reviews"
          accentWord="Reviews"
          subtitle="Real buyers. Real devices. Real peace of mind."
        />
        <div className="mt-10 grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="flex flex-col rounded-[24px] border border-border bg-section p-6 shadow-[0_8px_16px_rgba(8,21,47,0.04)] transition duration-[220ms] hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(8,21,47,0.08)]"
            >
              <div className="flex gap-0.5 text-star">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-[18px] w-[18px] ${i < Math.floor(r.rating) ? "fill-star" : "fill-transparent opacity-40"}`}
                  />
                ))}
              </div>
              <p className="mt-3.5 flex-1 text-sm leading-[1.5] text-navy/85">
                &ldquo;{r.text}&rdquo;
              </p>
              <p className="mt-3 text-sm font-bold text-navy">{r.name}</p>
              <p className="text-[12.5px] text-muted">{r.city}</p>
            </div>
          ))}
        </div>
      </PageShell>
    </section>
  );
}
