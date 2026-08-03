"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { useLogout } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { adminNav, breadcrumbForPath } from "@/features/admin/nav";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/commerce.service";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    catalog: true,
    inventory: true,
    orders: true,
  });
  const [dark, setDark] = useState(false);
  const [warehouseId, setWarehouseId] = useState("all");
  const [q, setQ] = useState("");

  const warehouses = useQuery({
    queryKey: ["admin", "warehouses-select"],
    queryFn: () => adminService.warehouses(),
    staleTime: 120_000,
  });

  const crumbs = useMemo(() => breadcrumbForPath(pathname), [pathname]);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    if (/^ord/i.test(term) || term.includes("-")) {
      router.push(`/admin/orders`);
      return;
    }
    router.push(`/admin/products?q=${encodeURIComponent(term)}`);
  }

  const sidebar = (
    <aside
      className={cn(
        "flex h-full flex-col bg-[#0b1b3a] text-white transition-all",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-extrabold">
          EC
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold tracking-wide">ELECTRONICS CART</p>
            <p className="text-[11px] text-white/50">Admin Console</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {adminNav.map((group) => {
          const active =
            group.href === pathname ||
            group.items?.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
          if (!group.items?.length) {
            const Icon = group.icon;
            return (
              <Link
                key={group.id}
                href={group.href || "/admin"}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  active ? "bg-primary text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && group.label}
              </Link>
            );
          }

          const open = openGroups[group.id] ?? false;
          const Icon = group.icon;
          return (
            <div key={group.id}>
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{group.label}</span>
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </>
                )}
              </button>
              {!collapsed && open && (
                <div className="ml-3 space-y-0.5 border-l border-white/10 pl-3">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const itemActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold transition",
                          itemActive
                            ? "bg-primary text-white"
                            : "text-white/60 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        {ItemIcon ? <ItemIcon className="h-3.5 w-3.5" /> : null}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-white/5 px-3 py-2">
            <p className="truncate text-xs font-semibold">{user?.email || "Admin User"}</p>
            <p className="text-[10px] text-white/50">Super Admin</p>
          </div>
        )}
        <button
          type="button"
          className="text-xs text-white/50 hover:text-white"
          onClick={async () => {
            await logout.mutateAsync();
            router.push("/auth/login");
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className={cn("min-h-screen bg-[#f4f7fb]", dark && "dark bg-[#0a1224] text-white")}>
      <div className="flex min-h-screen">
        <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 z-50 shadow-xl">{sidebar}</div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 md:px-6">
              <button
                type="button"
                className="rounded-lg border border-border p-2 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="hidden rounded-lg border border-border p-2 lg:inline-flex"
                onClick={() => setCollapsed((v) => !v)}
                aria-label="Collapse sidebar"
              >
                {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>

              <nav className="hidden text-xs text-muted md:flex md:items-center md:gap-1">
                {crumbs.map((c, i) => (
                  <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
                    {i > 0 && <span>/</span>}
                    {c.href && i < crumbs.length - 1 ? (
                      <Link href={c.href} className="hover:text-primary">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-navy">{c.label}</span>
                    )}
                  </span>
                ))}
              </nav>

              <form onSubmit={onSearch} className="relative mx-auto hidden w-full max-w-xl md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by order ID, customer, product, SKU…"
                  className="pl-9"
                />
              </form>

              <div className="ml-auto flex items-center gap-2">
                <select
                  className="hidden rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-navy sm:block"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                >
                  <option value="all">All Warehouses</option>
                  {(warehouses.data ?? []).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name || w.code || w.id}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="relative rounded-xl border border-border p-2"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4 text-navy" />
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-border p-2"
                  aria-label="Toggle theme"
                  onClick={() => setDark((v) => !v)}
                >
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link
                  href="/"
                  className="hidden rounded-xl border border-border px-3 py-2 text-xs font-semibold text-navy md:inline-flex"
                >
                  Storefront
                </Link>
              </div>
            </div>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
