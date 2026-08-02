"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Warehouse,
  Users,
  BarChart3,
  Boxes,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { useLogout } from "@/hooks/use-auth";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-section">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-navy text-white lg:block">
          <div className="border-b border-white/10 px-5 py-6">
            <Link href="/" className="text-sm font-extrabold tracking-[0.4px]">
              ELECTRONICS CART
            </Link>
            <p className="mt-1 text-xs text-subtext">Admin Console</p>
            {user?.email ? (
              <p className="mt-2 truncate text-[11px] text-subtext">{user.email}</p>
            ) : null}
          </div>
          <nav className="space-y-1 p-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-semibold transition",
                  pathname === l.href
                    ? "bg-primary text-white"
                    : "text-subtext hover:bg-white/10 hover:text-white",
                )}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-4 left-0 right-0 space-y-2 px-5">
            <button
              type="button"
              className="text-xs text-subtext hover:text-white"
              onClick={async () => {
                await logout.mutateAsync();
                router.push("/auth/login");
              }}
            >
              Sign out
            </button>
            <Link href="/" className="block text-xs text-subtext hover:text-white">
              ← Back to storefront
            </Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/90 px-5 backdrop-blur md:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-bold text-navy">Admin</span>
            </div>
            <p className="hidden text-sm text-muted md:block">Operations · Revenue · Inventory</p>
            <div className="flex gap-2 overflow-x-auto lg:hidden">
              {links.slice(0, 4).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </header>
          <div className="p-5 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
