"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminShell } from "@/features/admin/admin-shell";
import { AdminPanel } from "@/features/admin/ui";
import { AdminTable } from "@/features/admin/admin-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ResourcePageProps<T extends object> = {
  title: string;
  accent?: string;
  description?: string;
  queryKey: unknown[];
  queryFn: () => Promise<T[]>;
  columns: ColumnDef<T, unknown>[];
  createHref?: string;
  createLabel?: string;
  exportName?: string;
  searchPlaceholder?: string;
};

export function AdminResourcePage<T extends object>({
  title,
  accent,
  description,
  queryKey,
  queryFn,
  columns,
  createHref,
  createLabel = "Create",
  exportName = "export",
  searchPlaceholder,
}: ResourcePageProps<T>) {
  const q = useQuery({ queryKey, queryFn, staleTime: 30_000, retry: 1 });
  const rows = useMemo(() => q.data ?? [], [q.data]);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">
            {title} {accent ? <span className="text-accent">{accent}</span> : null}
          </h1>
          {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
        </div>
        {createHref ? (
          <Link href={createHref}>
            <Button>{createLabel}</Button>
          </Link>
        ) : null}
      </div>
      <AdminPanel title={`${title} list`} className="mt-6">
        <AdminTable
          data={rows}
          columns={columns}
          loading={q.isLoading}
          error={q.isError ? (q.error as Error)?.message || "Failed to load" : null}
          exportName={exportName}
          searchPlaceholder={searchPlaceholder}
          onRefresh={() => void q.refetch()}
        />
      </AdminPanel>
    </AdminShell>
  );
}
