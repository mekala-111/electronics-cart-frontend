"use client";

import { AdminShell } from "@/features/admin/admin-shell";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useAdminCustomers } from "@/hooks/use-commerce";
import { formatInr } from "@/lib/utils";

export default function AdminCustomersPage() {
  const { data, isLoading } = useAdminCustomers();
  const rows = data?.data ?? [];

  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Cust<span className="text-accent">omers</span>
      </h1>
      <LiveDataBanner show={data?.degraded} className="mt-4" />
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-border bg-white shadow-[var(--shadow-soft)]">
        {isLoading && !data ? (
          <div className="h-48 animate-pulse bg-section" />
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-section text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">LTV</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.email}-${r.name}`} className="border-b border-border/70">
                  <td className="px-4 py-3 font-medium text-navy">{r.name}</td>
                  <td className="px-4 py-3 font-medium text-navy">{r.email}</td>
                  <td className="px-4 py-3 font-medium text-navy">{r.orders}</td>
                  <td className="px-4 py-3 font-medium text-navy">{formatInr(r.ltv)}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No customers found.
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
