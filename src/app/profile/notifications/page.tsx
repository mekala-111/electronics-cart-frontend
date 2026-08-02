"use client";

import { ProfileShell } from "@/features/profile/profile-shell";
import { RequireAuth } from "@/components/shared/require-auth";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { mockNotifications } from "@/lib/fallbacks";
import { useQuery } from "@tanstack/react-query";
import { withApiFallback } from "@/lib/query-fallback";

export default function NotificationsPage() {
  const { data } = useQuery({
    queryKey: ["profile", "notifications"],
    queryFn: () =>
      withApiFallback(async () => {
        // Notifications endpoint not exposed publicly yet
        throw new Error("unavailable");
      }, mockNotifications.map((n) => n)),
  });

  return (
    <RequireAuth>
      <ProfileShell title="Notifications">
        <LiveDataBanner show={data?.degraded} className="mb-4" />
        <ul className="space-y-3">
          {(data?.data ?? mockNotifications).map((n) => (
            <li key={n} className="rounded-[18px] border border-border px-4 py-3 text-sm text-navy">
              {n}
            </li>
          ))}
        </ul>
      </ProfileShell>
    </RequireAuth>
  );
}
