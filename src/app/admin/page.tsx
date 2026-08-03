"use client";

import { AdminShell } from "@/features/admin/admin-shell";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useAdminDashboard, useAdminOrders } from "@/hooks/use-commerce";
import { formatInr } from "@/lib/utils";

export default function AdminDashboardPage() {
  const dash = useAdminDashboard();
  const orders = useAdminOrders();
  const cards = dash.data?.data.kpis ?? [];
  const series = dash.data?.data.series ?? [];
  const bars = series.length ? series : [40, 55, 48, 70, 62, 80, 74, 90, 85, 95, 88, 100];
  const recent = (orders.data?.data ?? []).slice(0, 4);

  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Admin <span className="text-accent">Dashboard</span>
      </h1>
      <p className="mt-2 text-muted">Live store metrics from analytics + recent orders.</p>
      <LiveDataBanner show={dash.data?.degraded || orders.data?.degraded} className="mt-4" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-[24px] border border-border bg-white p-5 shadow-[var(--shadow-soft)]"
          >
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-bold text-navy">Sales trend</h2>
          <div className="mt-6 flex h-48 items-end gap-2">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-lg bg-gradient-to-t from-primary to-primary/60"
                style={{ height: `${Math.max(h, 4)}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-bold text-navy">Recent orders</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {recent.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-[14px] border border-border px-3 py-2.5"
              >
                <span className="font-semibold text-navy">{o.id}</span>
                <span className="text-muted">{o.status}</span>
                <span className="font-bold text-primary">
                  {typeof o.total === "number" ? formatInr(o.total) : o.total}
                </span>
              </li>
            ))}
            {!recent.length && <li className="text-muted">No orders yet.</li>}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
