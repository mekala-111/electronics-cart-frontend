"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ProfileShell } from "@/features/profile/profile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryState } from "@/components/shared/query-state";
import { RequireAuth } from "@/components/shared/require-auth";
import { useToast } from "@/components/shared/toast";
import { cn, formatInr } from "@/lib/utils";
import { useOrdersUiStore } from "@/store";
import {
  formatOrderDate,
  prefetchOrder,
  useCancelOrder,
  useCancellationReasons,
  useOrders,
} from "@/hooks/use-orders";
import { describeApiError } from "@/types/api";
import { CANCELABLE_STATUSES, type OrderSummary } from "@/types/orders";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "completed",
] as const;

function filterOrders(
  rows: OrderSummary[],
  opts: { search: string; status: string; dateFrom: string; dateTo: string },
) {
  const q = opts.search.trim().toLowerCase();
  return rows.filter((o) => {
    if (opts.status !== "all" && o.status?.toLowerCase() !== opts.status) {
      return false;
    }
    if (q) {
      const hay = `${o.orderNumber ?? ""} ${o.id} ${o.status}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (opts.dateFrom && o.placedAt) {
      if (new Date(o.placedAt) < new Date(opts.dateFrom)) return false;
    }
    if (opts.dateTo && o.placedAt) {
      const end = new Date(opts.dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(o.placedAt) > end) return false;
    }
    return true;
  });
}

export default function OrdersPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const ordersQuery = useOrders();
  const cancelOrder = useCancelOrder();
  const [cancelTarget, setCancelTarget] = useState<OrderSummary | null>(null);
  const [reasonId, setReasonId] = useState("");
  const reasons = useCancellationReasons(Boolean(cancelTarget));

  const search = useOrdersUiStore((s) => s.search);
  const status = useOrdersUiStore((s) => s.status);
  const dateFrom = useOrdersUiStore((s) => s.dateFrom);
  const dateTo = useOrdersUiStore((s) => s.dateTo);
  const page = useOrdersUiStore((s) => s.page);
  const setSearch = useOrdersUiStore((s) => s.setSearch);
  const setStatus = useOrdersUiStore((s) => s.setStatus);
  const setDateFrom = useOrdersUiStore((s) => s.setDateFrom);
  const setDateTo = useOrdersUiStore((s) => s.setDateTo);
  const setPage = useOrdersUiStore((s) => s.setPage);
  const resetFilters = useOrdersUiStore((s) => s.resetFilters);

  const filtered = useMemo(
    () => filterOrders(ordersQuery.data ?? [], { search, status, dateFrom, dateTo }),
    [ordersQuery.data, search, status, dateFrom, dateTo],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function confirmCancel() {
    if (!cancelTarget) return;
    try {
      await cancelOrder.mutateAsync({
        orderId: cancelTarget.id,
        body: {
          cancellationReasonId: reasonId || undefined,
          note: "Cancelled by customer",
        },
      });
      toast.success("Order cancelled", cancelTarget.orderNumber ?? cancelTarget.id);
      setCancelTarget(null);
      setReasonId("");
    } catch (err) {
      toast.error("Cancel failed", describeApiError(err));
    }
  }

  return (
    <RequireAuth>
      <ProfileShell title="Your Orders">
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-xs"
              placeholder="Search order number"
              aria-label="Search orders"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Input
              type="date"
              aria-label="From date"
              className="max-w-[10rem]"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              aria-label="To date"
              className="max-w-[10rem]"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => void ordersQuery.refetch()}
              disabled={ordersQuery.isFetching}
            >
              Refresh
            </Button>
            <Button size="sm" variant="outline" type="button" onClick={resetFilters}>
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Status filter">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold capitalize",
                  status === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">
            Filters apply to your recent orders from the server (max 20; server pagination not
            available).
          </p>
        </div>

        <QueryState
          isLoading={ordersQuery.isLoading && !ordersQuery.data}
          isFetching={ordersQuery.isFetching}
          isError={ordersQuery.isError}
          error={ordersQuery.error}
          onRetry={() => void ordersQuery.refetch()}
          isEmpty={!ordersQuery.isLoading && (ordersQuery.data?.length ?? 0) === 0}
          emptyTitle="No orders yet"
          emptyDescription="Orders appear here after checkout."
          skeleton={
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-[18px] border border-border bg-section"
                />
              ))}
            </div>
          }
        >
          {filtered.length === 0 ? (
            <p className="text-sm text-muted">No orders match these filters.</p>
          ) : (
            <div className="space-y-3">
              {pageRows.map((o) => {
                const ref = o.orderNumber || o.id;
                const canCancel = CANCELABLE_STATUSES.has(o.status);
                return (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-border p-4"
                    onMouseEnter={() => void prefetchOrder(qc, ref)}
                    onFocus={() => void prefetchOrder(qc, ref)}
                  >
                    <div>
                      <p className="font-bold text-navy">{ref}</p>
                      <p className="text-sm text-muted">
                        {formatOrderDate(o.placedAt)} · {o.status}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-extrabold text-primary">
                        {formatInr(o.grandTotal)}
                      </span>
                      <Link href={`/orders/track?order=${encodeURIComponent(ref)}`}>
                        <Button size="sm" variant="outline">
                          Track
                        </Button>
                      </Link>
                      {canCancel ? (
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          disabled={cancelOrder.isPending}
                          onClick={() => {
                            setCancelTarget(o);
                            setReasonId("");
                          }}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {totalPages > 1 ? (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    className="rounded-[16px] border border-border px-4 py-2 text-sm font-semibold text-navy disabled:opacity-40"
                    disabled={safePage <= 1}
                    onClick={() => setPage(safePage - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted">
                    Page {safePage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="rounded-[16px] border border-border px-4 py-2 text-sm font-semibold text-navy disabled:opacity-40"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(safePage + 1)}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </QueryState>

        {cancelTarget ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
          >
            <div className="w-full max-w-md rounded-[24px] border border-border bg-white p-6 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
              <h2 id="cancel-order-title" className="text-lg font-bold text-navy">
                Cancel order?
              </h2>
              <p className="mt-2 text-sm text-muted">
                {cancelTarget.orderNumber || cancelTarget.id} will be cancelled on the server.
              </p>
              {(reasons.data?.length ?? 0) > 0 ? (
                <label className="mt-4 block text-sm font-semibold text-navy">
                  Reason
                  <select
                    className="mt-2 w-full rounded-[16px] border border-border bg-white px-4 py-3 text-sm"
                    value={reasonId}
                    onChange={(e) => setReasonId(e.target.value)}
                  >
                    <option value="">Select reason</option>
                    {reasons.data!.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  disabled={cancelOrder.isPending}
                >
                  Keep order
                </Button>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => void confirmCancel()}
                  disabled={cancelOrder.isPending}
                >
                  {cancelOrder.isPending ? "Cancelling…" : "Confirm cancel"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </ProfileShell>
    </RequireAuth>
  );
}
