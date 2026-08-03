"use client";

import { AdminShell } from "@/features/admin/admin-shell";
import { AdminPanel, AdminEmpty } from "@/features/admin/ui";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/commerce.service";

export default function AdminMarketingPage() {
  const q = useQuery({
    queryKey: ["admin", "marketing-dashboard"],
    queryFn: () => adminService.marketingDashboard() as Promise<Record<string, number>>,
    staleTime: 30_000,
  });
  const data = q.data ?? {};

  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Marketing <span className="text-accent">Dashboard</span>
      </h1>
      <p className="mt-2 text-sm text-muted">Live metrics from GET /admin/marketing/dashboard</p>
      {q.isError ? (
        <div className="mt-6">
          <AdminEmpty title="Failed to load marketing dashboard" description={(q.error as Error).message} />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["Published pages", data.publishedPages],
            ["Active coupons", data.activeCoupons],
            ["Running campaigns", data.runningEmailCampaigns],
            ["Feature flags", data.featureFlags],
            ["Running A/B tests", data.runningAbTests],
            ["Loyalty accounts", data.loyaltyAccounts],
          ].map(([label, value]) => (
            <AdminPanel key={String(label)} title={String(label)}>
              <p className="text-3xl font-extrabold text-navy">{value ?? (q.isLoading ? "…" : 0)}</p>
            </AdminPanel>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
