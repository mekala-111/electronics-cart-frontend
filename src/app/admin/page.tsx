"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { AdminShell } from "@/features/admin/admin-shell";
import { AdminPanel, AdminSkeleton, AdminStatCard } from "@/features/admin/ui";
import { AdminStatusPill, AdminTable } from "@/features/admin/admin-table";
import { adminQuickActions } from "@/features/admin/nav";
import { Button } from "@/components/ui/button";
import { useAdminDashboard, useAdminOrders } from "@/hooks/use-commerce";
import { formatInr } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

const PIE_COLORS = ["#1e5eff", "#f15a24", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

type OrderRow = {
  id: string;
  orderId: string;
  customer: string;
  total: number;
  status: string;
};

export default function AdminDashboardPage() {
  const dash = useAdminDashboard();
  const orders = useAdminOrders();
  const data = dash.data;
  const recent = (orders.data?.data ?? []).slice(0, 8);

  const statusPie = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders.data?.data ?? []) {
      const key = o.status || "unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [orders.data?.data]);

  const brandBars = useMemo(() => {
    // Brand share is not a dedicated admin KPI API — derive later from catalog reports.
    // Until then show inventory warehouse distribution from live stock rows.
    const map = new Map<string, number>();
    for (const row of data?.inventoryRows ?? []) {
      const key = row.warehouseCode || "Warehouse";
      map.set(key, (map.get(key) ?? 0) + Number(row.available ?? 0));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [data?.inventoryRows]);

  const orderCols: ColumnDef<OrderRow>[] = [
    { accessorKey: "id", header: "Order" },
    { accessorKey: "customer", header: "Customer" },
    {
      accessorKey: "total",
      header: "Amount",
      cell: ({ getValue }) => formatInr(Number(getValue() ?? 0)),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => <AdminStatusPill status={String(getValue() ?? "")} />,
    },
  ];

  const revenueKpi = data?.kpis.find((k) => /revenue/i.test(k.label))?.value ?? "—";
  const ordersKpi = data?.kpis.find((k) => /orders/i.test(k.label))?.value ?? String(recent.length);
  const aovKpi = data?.kpis.find((k) => /aov/i.test(k.label))?.value ?? "—";

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy md:text-3xl">
            Welcome back, <span className="text-accent">Admin</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Live ERP overview · auto-refreshes every 60s · {new Date().toLocaleString("en-IN")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void dash.refetch();
            void orders.refetch();
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {dash.isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <AdminSkeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <AdminStatCard label="Total Revenue" value={revenueKpi} />
          <AdminStatCard label="Orders" value={ordersKpi} href="/admin/orders" />
          <AdminStatCard label="Average Order Value" value={aovKpi} />
          <AdminStatCard
            label="Customers"
            value={data?.totals.customers ?? 0}
            href="/admin/customers"
          />
          <AdminStatCard
            label="Products"
            value={data?.totals.products ?? 0}
            href="/admin/products"
          />
          <AdminStatCard
            label="Low Stock Items"
            value={data?.totals.lowStock ?? 0}
            href="/admin/inventory/low-stock"
            hint="View alerts"
          />
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <AdminStatCard label="Units on hand" value={data?.totals.units ?? 0} href="/admin/inventory" />
        <AdminStatCard
          label="Warehouses"
          value={data?.totals.warehouses ?? 0}
          href="/admin/inventory/warehouses"
        />
        <AdminStatCard
          label="Active Coupons"
          value={data?.totals.activeCoupons ?? 0}
          href="/admin/marketing/coupons"
        />
        <AdminStatCard
          label="Campaigns"
          value={data?.totals.campaigns ?? 0}
          href="/admin/marketing"
        />
        <AdminStatCard label="Feature Flags" value={data?.totals.featureFlags ?? 0} />
        <AdminStatCard label="Captured" value={data?.kpis.find((k) => /captured/i.test(k.label))?.value ?? "—"} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <AdminPanel title="Revenue overview" className="xl:col-span-2">
          <div className="h-64">
            {(data?.series?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.series ?? []}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e5eff" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#1e5eff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatInr(Number(v ?? 0))} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1e5eff"
                    fill="url(#rev)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-full place-items-center text-sm text-muted">
                No revenue series from analytics yet.
              </p>
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Orders by status">
          <div className="h-64">
            {statusPie.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                    {statusPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-full place-items-center text-sm text-muted">No orders yet.</p>
            )}
          </div>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            {statusPie.map((s) => (
              <li key={s.name} className="flex justify-between capitalize">
                <span>{s.name}</span>
                <span className="font-semibold text-navy">{s.value}</span>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <AdminPanel title="Inventory by warehouse" className="xl:col-span-2">
          <div className="h-64">
            {brandBars.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf7" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1e5eff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-full place-items-center text-sm text-muted">
                No inventory rows returned.
              </p>
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Inventory summary">
          <ul className="space-y-3 text-sm">
            {(data?.inventoryBreakdown?.length
              ? data.inventoryBreakdown
              : [
                  { name: "Units on hand", value: data?.totals.units ?? 0 },
                  { name: "Low stock SKUs", value: data?.totals.lowStock ?? 0 },
                  { name: "Warehouses", value: data?.totals.warehouses ?? 0 },
                ]
            ).map((row) => (
              <li key={row.name} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span className="text-muted">{row.name}</span>
                <span className="font-bold text-navy">{row.value}</span>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>

      <AdminPanel title="Quick actions" className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10">
          {adminQuickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href + a.label}
                href={a.href}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-section/50 px-2 py-4 text-center transition hover:border-primary/40 hover:bg-white"
              >
                {Icon ? <Icon className="h-5 w-5 text-primary" /> : null}
                <span className="text-[11px] font-semibold text-navy">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </AdminPanel>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <AdminPanel title="Recent orders" className="xl:col-span-2" action={<Link href="/admin/orders" className="text-xs font-semibold text-primary">View all</Link>}>
          <AdminTable
            data={recent}
            columns={orderCols}
            loading={orders.isLoading}
            error={orders.isError ? "Failed to load orders" : null}
            exportName="recent-orders"
            searchPlaceholder="Filter recent orders…"
            onRefresh={() => void orders.refetch()}
          />
        </AdminPanel>

        <AdminPanel title="Low stock alerts" action={<Link href="/admin/inventory/low-stock" className="text-xs font-semibold text-primary">View all</Link>}>
          <ul className="max-h-96 space-y-2 overflow-auto text-sm">
            {(data?.lowStockRows ?? []).slice(0, 10).map((row, i) => {
              const r = row as Record<string, unknown>;
              return (
                <li key={i} className="rounded-xl border border-border px-3 py-2">
                  <p className="font-semibold text-navy">
                    {String(r.sku ?? r.variantSku ?? r.productName ?? `SKU ${i + 1}`)}
                  </p>
                  <p className="text-xs text-muted">
                    Available {String(r.available ?? r.availableQuantity ?? "—")} · Reorder{" "}
                    {String(r.reorderLevel ?? r.minQty ?? "—")}
                  </p>
                </li>
              );
            })}
            {!data?.lowStockRows?.length && (
              <li className="text-muted">No low-stock alerts.</li>
            )}
          </ul>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
