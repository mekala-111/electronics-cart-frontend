"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/features/admin/admin-shell";
import { AdminPanel, AdminEmpty } from "@/features/admin/ui";
import { apiGet } from "@/api/client";
import { Button } from "@/components/ui/button";

export function AdminLiveJsonPage({
  title,
  accent,
  path,
  description,
}: {
  title: string;
  accent?: string;
  path: string;
  description?: string;
}) {
  const q = useQuery({
    queryKey: ["admin", "live-json", path],
    queryFn: () => apiGet<unknown>(path),
    retry: 1,
    staleTime: 30_000,
  });

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">
            {title} {accent ? <span className="text-accent">{accent}</span> : null}
          </h1>
          <p className="mt-2 text-sm text-muted">{description ?? `Live data from GET ${path}`}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void q.refetch()}>
          Refresh
        </Button>
      </div>
      <AdminPanel title="API payload" className="mt-6">
        {q.isLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : q.isError ? (
          <AdminEmpty
            title="API unavailable"
            description={(q.error as Error)?.message || `GET ${path} failed`}
          />
        ) : (
          <pre className="max-h-[560px] overflow-auto rounded-xl bg-section p-4 text-xs text-navy">
            {JSON.stringify(q.data, null, 2)}
          </pre>
        )}
      </AdminPanel>
    </AdminShell>
  );
}
