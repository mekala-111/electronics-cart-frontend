"use client";

import { ShieldCheck, Shield, Truck, IndianRupee } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle } from "@/components/shared/section-title";
import { whyChooseItems } from "@/lib/mock-data";

const iconMap = {
  ShieldCheck,
  Shield,
  Truck,
  IndianRupee,
} as const;

/** Flutter WhyChooseUsSection */
export function WhyChooseUsSection() {
  return (
    <section className="bg-section">
      <PageShell className="section-pad">
        <SectionTitle
          eyebrow="TRUST"
          title="Why Choose Us"
          accentWord="Choose"
          subtitle="Built for buyers who want premium electronics without the premium risk."
        />
        <div className="mt-10 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {whyChooseItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] ?? ShieldCheck;
            return (
              <div
                key={item.title}
                className="rounded-[24px] border border-border bg-white p-[22px] shadow-[0_8px_14px_rgba(8,21,47,0.05)] transition duration-[220ms] hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(8,21,47,0.1)]"
                style={{ ["--hc" as string]: item.color }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${item.color}66`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px]"
                  style={{ backgroundColor: `${item.color}1A`, color: item.color }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-[17px] font-bold text-navy">{item.title}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.45] text-muted">{item.body}</p>
              </div>
            );
          })}
        </div>
      </PageShell>
    </section>
  );
}
