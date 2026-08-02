"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  Shield,
  LifeBuoy,
  Settings,
  Bell,
} from "lucide-react";
import { StoreChrome } from "@/components/layout/store-chrome";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle } from "@/components/shared/section-title";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

const nav = [
  { href: "/profile", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile/orders", label: "Orders", icon: Package },
  { href: "/profile/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile/addresses", label: "Addresses", icon: MapPin },
  { href: "/profile/warranty", label: "Warranty", icon: Shield },
  { href: "/profile/support", label: "Support Tickets", icon: LifeBuoy },
  { href: "/profile/settings", label: "Settings", icon: Settings },
  { href: "/profile/notifications", label: "Notifications", icon: Bell },
];

export function ProfileShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const words = title.trim().split(/\s+/);
  const accentWord = words[words.length - 1];

  return (
    <StoreChrome>
      <PageShell className="section-pad">
        <SectionTitle
          eyebrow="ACCOUNT"
          title={title}
          accentWord={accentWord}
          subtitle={
            user
              ? `Signed in as ${user.name} · ${user.email}`
              : undefined
          }
          action={
            !user ? (
              <Link href="/auth/login" className="text-[15px] font-semibold text-primary hover:underline">
                Sign in
              </Link>
            ) : undefined
          }
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-[24px] border border-border bg-white p-3 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  pathname === n.href
                    ? "bg-primary/10 text-primary"
                    : "text-navy hover:bg-search",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </aside>
          <div className="rounded-[24px] border border-border bg-white p-6 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
            {children}
          </div>
        </div>
      </PageShell>
    </StoreChrome>
  );
}
