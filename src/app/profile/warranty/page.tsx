"use client";

import { ProfileShell } from "@/features/profile/profile-shell";
import { RequireAuth } from "@/components/shared/require-auth";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { mockWarranty } from "@/lib/fallbacks";
import { useQuery } from "@tanstack/react-query";
import { withApiFallback } from "@/lib/query-fallback";
import { apiGet } from "@/api/client";
import { endpoints } from "@/api/endpoints";

export default function WarrantyPage() {
  const { data } = useQuery({
    queryKey: ["warranty", "mine"],
    queryFn: () =>
      withApiFallback(async () => {
        await apiGet(endpoints.warranty.plans);
        return mockWarranty;
      }, mockWarranty),
  });
  const w = data?.data ?? mockWarranty;

  return (
    <RequireAuth>
      <ProfileShell title="Warranty">
        <LiveDataBanner show={data?.degraded} className="mb-4" />
        <div className="rounded-[18px] border border-border p-5">
          <p className="font-bold text-navy">{w.device}</p>
          <p className="mt-2 text-sm text-muted">Serial · {w.serial}</p>
          <p className="mt-1 text-sm text-muted">Expires · {w.expires}</p>
          <p className="mt-3 text-sm font-semibold text-success">{w.status}</p>
        </div>
      </ProfileShell>
    </RequireAuth>
  );
}
