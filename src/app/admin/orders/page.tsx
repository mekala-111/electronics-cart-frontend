"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin/admin-shell";
import { cn, formatInr } from "@/lib/utils";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useAdminOrders } from "@/hooks/use-commerce";

const statuses = ["Pending", "Packed", "Shipped", "Delivered", "Returned", "Refunded"] as const;

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<string>("All");
  const { data, isLoading } = useAdminOrders(filter === "All" ? undefined : filter);
  const list = data?.data ?? [];

  return (
      <AdminShell>
        <h1 className="text-3xl font-extrabold text-navy">
          Order <span className="text-accent">Management</span>
        </h1>
        <LiveDataBanner show={data?.degraded} className="mt-4" />
        <div className="mt-6 flex flex-wrap gap-2">
          {["All", ...statuses].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                filter === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-6 overflow-x-auto rounded-[24px] border border-border bg-white shadow-[var(--shadow-soft)]">
          {isLoading && !data ? (
            <div className="h-48 animate-pulse bg-section" />
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-border bg-section text-muted">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="border-b border-border/70">
                    <td className="px-4 py-3 font-semibold text-navy">{r.id}</td>
                    <td className="px-4 py-3">{r.customer}</td>
                    <td className="px-4 py-3">{r.status}</td>
                    <td className="px-4 py-3 font-bold text-primary">
                      {typeof r.total === "number" ? formatInr(r.total) : r.total}
                    </td>
                    <td className="px-4 py-3 text-muted">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AdminShell>
  );
}
