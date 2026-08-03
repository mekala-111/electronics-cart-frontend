"use client";

import { AdminShell } from "@/features/admin/admin-shell";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useAdminInvoices } from "@/hooks/use-commerce";
import { formatInr } from "@/lib/utils";

export default function AdminInvoicesPage() {
  const { data, isLoading } = useAdminInvoices();
  const rows = data?.data ?? [];

  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Invo<span className="text-accent">ices</span>
      </h1>
      <LiveDataBanner show={data?.degraded} className="mt-4" />
      {isLoading && !data ? (
        <div className="mt-6 h-48 animate-pulse rounded-[18px] bg-section" />
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center justify-between rounded-[18px] border border-border bg-white px-4 py-3 shadow-[var(--shadow-soft)]"
            >
              <div>
                <span className="font-semibold text-navy">{inv.id}</span>
                <span className="ml-3 text-sm text-muted">{inv.order}</span>
              </div>
              <span className="font-bold text-primary">{formatInr(inv.amount)}</span>
            </li>
          ))}
          {!rows.length && <li className="text-muted">No invoices yet. Create one from Orders.</li>}
        </ul>
      )}
    </AdminShell>
  );
}
