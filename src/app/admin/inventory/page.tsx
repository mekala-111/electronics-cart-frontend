"use client";

import { AdminShell } from "@/features/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useAdminInventory } from "@/hooks/use-commerce";

export default function AdminInventoryPage() {
  const { data } = useAdminInventory();
  const inv = data?.data;

  return (
      <AdminShell>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-navy">
              Inventory <span className="text-accent">Control</span>
            </h1>
            <p className="mt-2 text-muted">Warehouses, POs, and low-stock alerts.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Scan</Button>
            <Button>New PO</Button>
          </div>
        </div>
        <LiveDataBanner show={data?.degraded} className="mt-4" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-muted">Units on hand</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{inv?.units ?? 0}</p>
          </div>
          <div className="rounded-[24px] border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-muted">Low stock SKUs</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{inv?.lowStock ?? 0}</p>
          </div>
          <div className="rounded-[24px] border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-muted">Warehouses</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{inv?.warehouses.length ?? 0}</p>
          </div>
        </div>
        <div className="mt-6 rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-bold text-navy">Warehouses</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {(inv?.warehouses ?? []).map((w) => (
              <li key={w} className="rounded-[14px] border border-border px-3 py-2.5 text-navy">
                {w}
              </li>
            ))}
          </ul>
        </div>
      </AdminShell>
  );
}
