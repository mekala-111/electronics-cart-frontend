import { StoreChrome } from "@/components/layout/store-chrome";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SupportPage() {
  return (
    <StoreChrome>
      <PageShell className="py-12">
        <h1 className="text-3xl font-extrabold text-navy">
          Help & <span className="text-accent">Support</span>
        </h1>
        <p className="mt-2 text-muted">Warranty, returns, and order assistance.</p>
        <div className="mt-8 max-w-lg space-y-3 rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
          <Input placeholder="Your email" />
          <Input placeholder="Order ID (optional)" />
          <textarea
            className="min-h-28 w-full rounded-[16px] border border-border px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="How can we help?"
          />
          <Button>Send message</Button>
        </div>
      </PageShell>
    </StoreChrome>
  );
}
