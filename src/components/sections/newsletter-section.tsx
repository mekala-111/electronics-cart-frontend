"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { CtaButton } from "@/components/shared/cta-button";
import { useToast } from "@/components/shared/toast";

/** Flutter NewsletterSection */
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  return (
    <section className="bg-white">
      <PageShell className="section-pad">
        <div
          className="rounded-[28px] px-5 py-7 text-center shadow-[0_14px_28px_rgba(8,21,47,0.25)] md:px-10 md:py-10"
          style={{
            background: "linear-gradient(135deg, #08152F 0%, rgba(8,21,47,0.92) 45%, #122548 100%)",
          }}
        >
          <h2 className="text-[26px] font-extrabold tracking-[-0.6px] text-white md:text-[34px]">
            Stay ahead on deals
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl text-[15px] leading-[1.45] text-subtext">
            Get flash deals, new arrivals, and refurbished drops in your inbox.
          </p>
          <form
            className="mx-auto mt-7 flex max-w-[560px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-3.5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                toast.error("Enter a valid email");
                return;
              }
              setLoading(true);
              await new Promise((r) => setTimeout(r, 500));
              setLoading(false);
              setEmail("");
              toast.success("Subscribed", "Deal alerts are on the way.");
            }}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="h-[52px] w-full max-w-[420px] flex-1 rounded-[16px] border-0 bg-white px-5 text-sm text-navy outline-none placeholder:text-muted focus:ring-4 focus:ring-primary/25"
            />
            <CtaButton label="Subscribe" variant="primary" type="submit" loading={loading} />
          </form>
        </div>
      </PageShell>
    </section>
  );
}
