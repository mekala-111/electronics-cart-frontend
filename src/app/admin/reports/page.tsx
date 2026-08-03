"use client";

import { AdminShell } from "@/features/admin/admin-shell";
import { useAdminReports } from "@/hooks/use-commerce";

export default function AdminReportsPage() {
  const { data, isLoading } = useAdminReports();
  const funnelSteps = Array.isArray((data?.funnels as { steps?: unknown })?.steps)
    ? ((data?.funnels as { steps: Array<{ step?: string; count?: number }> }).steps)
    : Array.isArray(data?.funnels)
      ? (data?.funnels as Array<{ step?: string; count?: number }>)
      : [];
  const trendRows = Array.isArray(data?.trends)
    ? (data?.trends as Array<{ label?: string; value?: number; revenue?: number; date?: string }>)
    : Array.isArray((data?.trends as { series?: unknown })?.series)
      ? ((data?.trends as { series: Array<{ label?: string; value?: number; revenue?: number }> }).series)
      : [];
  const saved = data?.reports ?? [];

  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Reports & <span className="text-accent">Analytics</span>
      </h1>
      {isLoading && !data ? (
        <div className="mt-8 h-48 animate-pulse rounded-[24px] bg-section" />
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-bold text-navy">Conversion funnel</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {funnelSteps.slice(0, 8).map((s, i) => (
                <li key={`${s.step}-${i}`} className="flex justify-between border-b border-border/60 py-2">
                  <span className="capitalize text-muted">{s.step || `Step ${i + 1}`}</span>
                  <span className="font-semibold text-navy">{s.count ?? 0}</span>
                </li>
              ))}
              {!funnelSteps.length && <li className="text-muted">No funnel data.</li>}
            </ul>
          </div>
          <div className="rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-bold text-navy">Sales trend</h2>
            <div className="mt-6 flex h-32 items-end gap-1">
              {trendRows.slice(-20).map((t, i) => {
                const val = Number(t.revenue ?? t.value ?? 0);
                const max = Math.max(...trendRows.map((x) => Number(x.revenue ?? x.value ?? 0)), 1);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-primary to-accent/40"
                    style={{ height: `${Math.max((val / max) * 100, 4)}%` }}
                    title={String(t.label ?? val)}
                  />
                );
              })}
              {!trendRows.length && <p className="text-sm text-muted">No trend data.</p>}
            </div>
          </div>
          <div className="rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)] md:col-span-2">
            <h2 className="font-bold text-navy">Saved reports</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {saved.map((r, i) => {
                const row = r as { name?: string; title?: string; id?: string };
                return (
                  <li key={row.id ?? i} className="rounded-[14px] border border-border px-3 py-2.5 text-navy">
                    {row.name || row.title || `Report ${i + 1}`}
                  </li>
                );
              })}
              {!saved.length && <li className="text-muted">No saved reports on the API yet.</li>}
            </ul>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
