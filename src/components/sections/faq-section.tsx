"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle } from "@/components/shared/section-title";
import { faqs } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Flutter FaqSection */
export function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-section">
      <PageShell className="section-pad">
        <SectionTitle
          eyebrow="HELP"
          title="Frequently Asked Questions"
          accentWord="Questions"
          subtitle="Quick answers about quality, warranty, and delivery."
        />
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className={cn(
                "mb-3 overflow-hidden rounded-[18px] border bg-white transition duration-200",
                open === i ? "border-primary/35" : "border-border",
              )}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left text-[15px] font-semibold text-navy"
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                {f.q}
                <span className={cn("text-lg", open === i ? "text-primary" : "text-nav-muted")}>
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i ? (
                <p className="px-5 pb-[18px] text-left text-sm leading-[1.5] text-muted">{f.a}</p>
              ) : null}
            </div>
          ))}
        </div>
      </PageShell>
    </section>
  );
}
