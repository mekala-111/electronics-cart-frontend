"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageShell } from "@/components/layout/page-shell";

/** Auth shell — same chrome as storefront + glass card (Flutter visual language) */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <Navbar />
      <main className="relative min-h-[70vh] overflow-hidden bg-navy py-12 md:py-16">
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(30,94,255,0.25),transparent_50%)]" />

        <PageShell className="relative grid items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden text-white lg:block"
          >
            <p className="text-xs font-bold tracking-[1.6px] text-primary">ELECTRONICS CART</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.8px] leading-[1.15]">
              New & <span className="text-accent">Refurbished</span>
              <br />
              Laptops You Can Trust
            </h2>
            <p className="mt-4 max-w-md text-subtext">
              Certified Quality. 1 Year Warranty. Best Prices. Fast Delivery.
            </p>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="relative mt-10 max-w-md"
            >
              <Image
                src="/images/laptop.png"
                alt=""
                width={520}
                height={340}
                className="drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mx-auto w-full max-w-[440px] rounded-[28px] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
          >
            <Link href="/" className="mb-6 block text-center lg:hidden">
              <p className="text-lg font-extrabold tracking-[0.4px] text-white">ELECTRONICS CART</p>
              <p className="text-xs text-subtext">Smart Electronics. Trusted Prices.</p>
            </Link>
            <h1 className="text-center text-2xl font-extrabold text-white">{title}</h1>
            <p className="mt-2 text-center text-sm text-subtext">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </motion.div>
        </PageShell>
      </main>
      <SiteFooter />
    </>
  );
}
