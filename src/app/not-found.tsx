import Link from "next/link";
import { StoreChrome } from "@/components/layout/store-chrome";
import { PageShell } from "@/components/layout/page-shell";
import { CtaButton } from "@/components/shared/cta-button";

export default function NotFound() {
  return (
    <StoreChrome>
      <PageShell className="section-pad text-center">
        <p className="text-xs font-bold tracking-[1.6px] text-primary">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-navy">
          Page not <span className="text-accent">found</span>
        </h1>
        <p className="mt-3 text-muted">The page you requested isn&apos;t available.</p>
        <Link href="/" className="mt-8 inline-block">
          <CtaButton label="Back to Home" />
        </Link>
      </PageShell>
    </StoreChrome>
  );
}
