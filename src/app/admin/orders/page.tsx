"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { cn, formatInr } from "@/lib/utils";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import {
  useAdminCancelOrder,
  useAdminCreateInvoice,
  useAdminOrders,
} from "@/hooks/use-commerce";

const statuses = [
  "All",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
] as const;

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<string>("All");
  const { data, isLoading } = useAdminOrders(filter === "All" ? undefined : filter);
  const cancel = useAdminCancelOrder();
  const invoice = useAdminCreateInvoice();
  const list = data?.data ?? [];

  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Order <span className="text-accent">Management</span>
      </h1>
      <LiveDataBanner show={data?.degraded} className="mt-4" />
      <div className="mt-6 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold capitalize",
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
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.orderId} className="border-b border-border/70">
                  <td className="px-4 py-3 font-semibold text-navy">{r.id}</td>
                  <td className="px-4 py-3">{r.customer}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3 font-bold text-primary">
                    {typeof r.total === "number" ? formatInr(r.total) : r.total}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {["pending", "confirmed"].includes(r.status) && (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          disabled={cancel.isPending}
                          onClick={() => cancel.mutate({ id: r.orderId, note: "Cancelled by admin" })}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 px-2 text-xs"
                        disabled={invoice.isPending}
                        onClick={() => invoice.mutate(r.orderId)}
                      >
                        Invoice
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!list.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
