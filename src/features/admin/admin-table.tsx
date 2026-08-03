"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AdminEmpty, AdminSkeleton } from "@/features/admin/ui";
import { Download, RefreshCw } from "lucide-react";

type AdminTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  loading?: boolean;
  error?: string | null;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  exportName?: string;
  emptyTitle?: string;
  className?: string;
};

export function AdminTable<T>({
  data,
  columns,
  loading,
  error,
  searchPlaceholder = "Search…",
  onRefresh,
  exportName = "export",
  emptyTitle = "No records found",
  className,
}: AdminTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const csv = useMemo(() => {
    const rows = table.getFilteredRowModel().rows;
    if (!rows.length) return "";
    const headers = table.getVisibleLeafColumns().map((c) => c.id);
    const lines = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const v = row.getValue(h);
            return `"${String(v ?? "").replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ];
    return lines.join("\n");
  }, [table, data, globalFilter, sorting]);

  function downloadCsv() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <AdminSkeleton className="h-64" />;
  if (error) {
    return (
      <AdminEmpty title="Failed to load" description={error} />
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          className="max-w-xs"
        />
        <div className="ml-auto flex gap-2">
          {onRefresh && (
            <Button type="button" variant="outline" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
          <Button type="button" variant="outline" onClick={downloadCsv} disabled={!csv}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {!table.getRowModel().rows.length ? (
        <AdminEmpty title={emptyTitle} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-section text-muted">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="cursor-pointer select-none px-4 py-3 font-semibold"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 hover:bg-section/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-navy">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminStatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const tone =
    s.includes("deliver") || s.includes("complete") || s.includes("success")
      ? "bg-success/15 text-success"
      : s.includes("cancel") || s.includes("fail") || s.includes("risk")
        ? "bg-danger/15 text-danger"
        : s.includes("ship") || s.includes("process")
          ? "bg-primary/15 text-primary"
          : "bg-accent/15 text-accent";
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", tone)}>
      {status}
    </span>
  );
}

export function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-primary hover:underline">
      {children}
    </Link>
  );
}
