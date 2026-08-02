"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
} from "lucide-react";
import { PageShell } from "./page-shell";
import { EcSearchBar } from "./search-bar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { useCartItemCount } from "@/hooks/use-cart";
import { useWishlistItemCount } from "@/hooks/use-wishlist";

/** Flutter Navbar — 90px, glass blur when scrolled */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCartItemCount();
  const { count: wishlistCount } = useWishlistItemCount();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition duration-[220ms]",
        scrolled
          ? "bg-white/86 shadow-[0_8px_24px_rgba(8,21,47,0.08)] backdrop-blur-[12px]"
          : "bg-white shadow-[0_2px_8px_rgba(8,21,47,0.04)]",
      )}
    >
      <div className="flex h-[90px] items-center">
      <PageShell maxWidth={null} className="flex h-full items-center">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <LogoMark />
          <div className="leading-none">
            <p className="text-[15px] font-extrabold tracking-[0.4px] text-navy">
              ELECTRONICS CART
            </p>
            <p className="mt-0.5 text-[10px] tracking-[0.1px] text-nav-muted">
              Smart Electronics. Trusted Prices.
            </p>
          </div>
        </Link>

        <nav className="ml-7 hidden items-center gap-2 xl:flex" aria-label="Primary">
          <NavChip label="Categories" chevron bordered />
          <NavItem href="/products?tab=brands" label="Brands" />
          <NavItem href="/products?deal=flash" label="Deals" badge="Hot" />
          <NavItem href="/products?condition=refurbished" label="Refurbished" />
          <NavItem href="/products?tag=new" label="New Laptops" />
          <NavItem href="/support" label="Support" chevron />
        </nav>

        <div className="mx-6 hidden min-w-0 flex-1 md:block">
          <EcSearchBar />
        </div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ActionItem
            href="/profile/wishlist"
            icon={<Heart className="h-[22px] w-[22px]" />}
            label="Wishlist"
            badge={wishlistCount > 0 ? wishlistCount : undefined}
          />
          <ActionItem
            href="/cart"
            icon={<ShoppingCart className="h-[22px] w-[22px]" />}
            label="Cart"
            badge={count > 0 ? count : undefined}
          />
          <ActionItem
            href={user ? "/profile" : "/auth/login"}
            icon={<User className="h-[22px] w-[22px]" />}
            label={user ? "Account" : "Login"}
          />
          <button
            type="button"
            className="rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 xl:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Menu className="h-5 w-5 text-navy" />
          </button>
        </div>
      </PageShell>
      </div>
      {menuOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-white px-5 py-4 xl:hidden"
          role="navigation"
          aria-label="Mobile"
        >
          <div className="mb-3 md:hidden">
            <EcSearchBar />
          </div>
          <div className="flex flex-col gap-1">
            {[
              ["/products", "All products"],
              ["/products?deal=flash", "Deals"],
              ["/products?condition=refurbished", "Refurbished"],
              ["/products?tag=new", "New Laptops"],
              ["/support", "Support"],
              [user ? "/profile" : "/auth/login", user ? "Account" : "Login"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-[12px] px-3 py-2.5 text-sm font-semibold text-navy hover:bg-search focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        d="M8 12.3V31.7H34.3L38.7 18.5H18.5"
        stroke="#1E5EFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14.1" cy="37.8" r="3.2" fill="#1E5EFF" />
      <circle cx="27.3" cy="37.8" r="3.2" fill="#1E5EFF" />
      <path d="M21.1 9.7V22.9M21.1 9.7H31.7M21.1 16.3H29.9M21.1 22.9H31.7" stroke="#F15A24" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function NavChip({
  label,
  chevron,
  bordered,
}: {
  label: string;
  chevron?: boolean;
  bordered?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[10px] px-3.5 py-2 text-[13.5px] font-medium text-navy transition hover:bg-search",
        bordered && "border border-[#E2E6EE]",
      )}
    >
      {label}
      {chevron ? <ChevronDown className="h-[18px] w-[18px] text-nav-muted" /> : null}
    </button>
  );
}

function NavItem({
  href,
  label,
  badge,
  chevron,
}: {
  href: string;
  label: string;
  badge?: string;
  chevron?: boolean;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 px-2 text-[13.5px] font-medium text-navy transition hover:text-primary"
    >
      {label}
      {badge ? (
        <span className="rounded bg-hot px-[5px] py-px text-[9px] font-bold text-white">{badge}</span>
      ) : null}
      {chevron ? <ChevronDown className="h-4 w-4 text-nav-muted" /> : null}
    </Link>
  );
}

function ActionItem({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center px-2 py-1 text-center"
    >
      <span className="relative text-navy transition group-hover:text-primary">
        {icon}
        {badge != null && badge > 0 ? (
          <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="mt-0.5 text-[11px] font-medium text-nav-muted transition group-hover:text-primary">
        {label}
      </span>
    </Link>
  );
}
