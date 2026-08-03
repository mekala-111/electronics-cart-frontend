"use client";

import { AdminShell } from "@/features/admin/admin-shell";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useAdminInventory } from "@/hooks/use-commerce";

export default function AdminInventoryPage() {
  const { data, isLoading } = useAdminInventory();
  const inv = data?.data;

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">
            Inventory <span className="text-accent">Control</span>
          </h1>
          <p className="mt-2 text-muted">Live stock, warehouses, and low-stock alerts.</p>
        </div>
      </div>
      <LiveDataBanner show={data?.degraded} className="mt-4" />
      {isLoading && !data ? (
        <div className="mt-8 h-48 animate-pulse rounded-[24px] bg-section" />
      ) : (
        <>
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
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="font-bold text-navy">Warehouses</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {(inv?.warehouses ?? []).map((w) => (
                  <li key={w} className="rounded-[14px] border border-border px-3 py-2.5 text-navy">
                    {w}
                  </li>
                ))}
                {!inv?.warehouses.length && <li>No warehouses returned.</li>}
              </ul>
            </div>
            <div className="rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="font-bold text-navy">Stock rows</h2>
              <ul className="mt-4 max-h-80 space-y-2 overflow-auto text-sm">
                {(inv?.rows ?? []).slice(0, 40).map((r, i) => (
                  <li
                    key={`${r.sku}-${i}`}
                    className="flex justify-between rounded-[14px] border border-border px-3 py-2.5 text-navy"
                  >
                    <span>
                      {r.sku || "SKU"} · {r.warehouseCode || "—"}
                    </span>
                    <span className="font-semibold">{r.available ?? 0}</span>
                  </li>
                ))}
                {!inv?.rows?.length && <li className="text-muted">No inventory rows.</li>}
              </ul>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
