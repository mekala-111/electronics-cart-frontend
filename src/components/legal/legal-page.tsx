import Link from "next/link";
import { StoreChrome } from "@/components/layout/store-chrome";
import { PageShell } from "@/components/layout/page-shell";

export type LegalSection = {
  heading: string;
  body: string[];
};

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <StoreChrome>
      <PageShell className="py-10 md:py-14">
        <nav className="text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-navy">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-navy">Legal</span>
        </nav>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
        <div className="mt-8 max-w-3xl space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-bold text-navy">{s.heading}</h2>
              <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-muted">
                {s.body.map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 max-w-3xl border-t border-border pt-6 text-sm text-muted">
          Questions?{" "}
          <Link href="/support" className="font-semibold text-primary hover:underline">
            Contact support
          </Link>
          .
        </p>
      </PageShell>
    </StoreChrome>
  );
}
