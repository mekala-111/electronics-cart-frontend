import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";

const cols: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "New Laptops", href: "/products?condition=new" },
      { label: "Refurbished", href: "/products?condition=refurbished" },
      { label: "All products", href: "/products" },
      { label: "Deals", href: "/products" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Warranty", href: "/legal/warranty" },
      { label: "Returns & refunds", href: "/legal/returns" },
      { label: "Shipping", href: "/legal/shipping" },
      { label: "Track order", href: "/orders/track" },
      { label: "Contact", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Return Policy", href: "/legal/returns" },
      { label: "Shipping Policy", href: "/legal/shipping" },
      { label: "Warranty Policy", href: "/legal/warranty" },
    ],
  },
];

/** Flutter SiteFooter */
export function SiteFooter() {
  return (
    <footer className="bg-navy text-white">
      <PageShell className="pb-7 pt-10 md:pt-16">
        <div className="flex flex-col gap-7 md:flex-row md:gap-10">
          <div className="md:flex-[3]">
            <p className="text-lg font-extrabold tracking-[0.4px]">ELECTRONICS CART</p>
            <p className="mt-2 text-[13px] text-subtext">Smart Electronics. Trusted Prices.</p>
            <p className="mt-4 max-w-sm text-[13.5px] leading-[1.5] text-subtext/85">
              Certified new & refurbished laptops with warranty,
              <br />
              fast delivery, and transparent condition grading.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-7 md:flex-[5]">
            {cols.map((c) => (
              <div key={c.title} className="w-[140px]">
                <p className="mb-3.5 text-sm font-bold">{c.title}</p>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.href + l.label} className="pb-2.5 text-[13px] text-subtext/85">
                      <Link href={l.href} className="hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-9 border-t border-white/12 pt-[18px]" />
        <div className="flex flex-col gap-3 text-[12.5px] text-subtext/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Electronics Cart. All rights reserved.</p>
          <p className="flex flex-wrap gap-x-2 gap-y-1">
            <Link href="/legal/privacy" className="hover:text-white">
              Privacy
            </Link>
            <span aria-hidden>·</span>
            <Link href="/legal/terms" className="hover:text-white">
              Terms
            </Link>
            <span aria-hidden>·</span>
            <Link href="/legal/returns" className="hover:text-white">
              Returns
            </Link>
          </p>
        </div>
      </PageShell>
    </footer>
  );
}
