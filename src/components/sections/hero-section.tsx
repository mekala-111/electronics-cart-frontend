"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Shield, RotateCcw, Lock } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { TrustCard } from "@/components/cards/trust-card";
import { HeroLaptop } from "@/components/cards/hero-laptop";
import { DiscountCard } from "@/components/cards/discount-card";
import { CtaButton } from "@/components/shared/cta-button";

/** Flutter HeroSection */
export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden rounded-b-[20px] md:h-[560px] xl:h-[620px] 2xl:h-[720px]">
      <Image
        src="/images/landingpg-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      {/* Flutter BackgroundPainter glows */}
      <div className="pointer-events-none absolute left-[8%] top-[55%] h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-primary/15 blur-[60px]" />
      <div className="pointer-events-none absolute right-[8%] top-[55%] h-[260px] w-[260px] -translate-y-1/2 rounded-full bg-accent/15 blur-[60px]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,21,47,0.72) 0%, rgba(8,21,47,0.35) 42%, transparent 78%)",
        }}
      />

      <PageShell className="relative py-10 md:flex md:h-full md:items-center md:py-10 xl:py-14 2xl:py-20">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[11fr_12fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[560px]"
          >
            <div className="inline-flex items-center gap-2 rounded-[20px] border border-white/20 bg-[rgba(16,28,58,0.2)] px-3.5 py-2 backdrop-blur-[10px]">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
              <span className="text-[11px] font-semibold tracking-[1.2px] text-white">
                CERTIFIED REFURBISHED
              </span>
            </div>

            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.08] tracking-[-1.2px] text-white md:mt-7 md:text-[40px] xl:text-[56px] 2xl:text-[72px]">
              New & <span className="text-accent">Refurbished</span>
              <br />
              Laptops You Can Trust
            </h1>

            <p className="mt-3.5 text-sm leading-[1.45] tracking-[0.1px] text-subtext md:mt-[18px] md:text-base">
              Certified Quality. 1 Year Warranty. Best Prices. Fast Delivery.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 md:mt-7">
              <TrustCard
                icon={<ShieldCheck />}
                label={"Certified\nProducts"}
                iconColor="#1E5EFF"
                width={128}
              />
              <TrustCard
                icon={<Shield />}
                label={"1 Year\nWarranty"}
                iconColor="#F15A24"
                width={128}
              />
              <TrustCard
                icon={<RotateCcw />}
                label={"Easy Returns\n7 Days"}
                iconColor="#2ECC71"
                width={128}
              />
              <TrustCard
                icon={<Lock />}
                label={"Secure\nPayments"}
                iconColor="#1E5EFF"
                width={128}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3.5 md:mt-8">
              <Link href="/products">
                <CtaButton label="Shop Now" variant="primary" showArrow />
              </Link>
              <Link href="/products?condition=refurbished">
                <CtaButton label="Explore Refurbished" variant="secondary" />
              </Link>
            </div>
          </motion.div>

          <div className="relative flex justify-center">
            <HeroLaptop />
            <DiscountCard className="absolute right-0 top-2 z-20 hidden lg:block" />
            <DiscountCard className="absolute -top-2 right-2 z-20 lg:hidden" />
          </div>
        </div>
      </PageShell>
    </section>
  );
}
