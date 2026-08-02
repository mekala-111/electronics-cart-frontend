"use client";

import { useQuery } from "@tanstack/react-query";
import {
  adminService,
} from "@/services/commerce.service";
import { queryKeys } from "@/hooks/query-keys";
import { withApiFallback } from "@/lib/query-fallback";
import { ApiError } from "@/types/api";
import {
  mockAdminKpis,
  mockAdminOrders,
  mockCustomers,
  mockInvoices,
  mockInventory,
} from "@/lib/fallbacks";
import { allProducts } from "@/lib/mock-data";
import { toUiProducts } from "@/models/product";
import type { OrderSummary } from "@/types/orders";

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: async () =>
      withApiFallback(
        async () => {
          const raw = await adminService.dashboard();
          const kpis = extractDashboardKpis(raw);
          if (!kpis.length) {
            throw new ApiError({
              message: "Dashboard metrics unavailable",
              code: "EMPTY_DASHBOARD",
              status: 502,
            });
          }
          return { kpis, sourceHint: "api" };
        },
        { kpis: mockAdminKpis.map((k) => ({ ...k })), sourceHint: "fallback" },
      ),
    staleTime: 60_000,
    retry: 1,
  });
}

function extractDashboardKpis(
  raw: unknown,
): Array<{ label: string; value: string }> {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.kpis)) {
    return obj.kpis as Array<{ label: string; value: string }>;
  }
  return [];
}

export function useAdminOrders(status?: string) {
  return useQuery({
    queryKey: queryKeys.adminOrders({ status }),
    queryFn: async () =>
      withApiFallback(
        async () => {
          const nestStatus = status?.toLowerCase();
          const res = await adminService.orders({
            page: 1,
            limit: 20,
            status: nestStatus && nestStatus !== "all" ? nestStatus : undefined,
          });
          return (res.items as OrderSummary[]).map((o) => ({
            id: o.orderNumber || o.id,
            orderId: o.id,
            customer: "—",
            total: o.grandTotal,
            status: o.status,
          }));
        },
        mockAdminOrders
          .filter((o) => !status || status === "All" || o.status === status)
          .map((o) => ({ ...o, orderId: o.id })),
        { treatEmptyAsFallback: true },
      ),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: queryKeys.adminProducts(),
    queryFn: async () =>
      withApiFallback(
        async () => {
          const res = await adminService.products({ page: 1, limit: 50 });
          return toUiProducts(res.items as Parameters<typeof toUiProducts>[0]);
        },
        allProducts.slice(0, 12),
        { treatEmptyAsFallback: true, isEmpty: (v) => v.length === 0 },
      ),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAdminInventory() {
  return useQuery({
    queryKey: queryKeys.adminInventory,
    queryFn: async () =>
      withApiFallback(
        async () => {
          const alerts = await adminService.lowStock();
          const lowStock = Array.isArray(alerts) ? alerts.length : 0;
          return {
            units: lowStock,
            warehouses: [] as string[],
            lowStock,
          };
        },
        mockInventory,
      ),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () =>
      withApiFallback(
        async () => {
          // Endpoint not wired yet — fail closed when fallbacks disabled
          throw new ApiError({
            message: "Customers API is not available",
            code: "NOT_IMPLEMENTED",
            status: 501,
          });
        },
        mockCustomers.map((c) => ({ ...c })),
      ),
    staleTime: 60_000,
  });
}

export function useAdminInvoices() {
  return useQuery({
    queryKey: ["admin", "invoices"],
    queryFn: async () =>
      withApiFallback(
        async () => {
          throw new ApiError({
            message: "Invoices API is not available",
            code: "NOT_IMPLEMENTED",
            status: 501,
          });
        },
        mockInvoices.map((i) => ({ ...i })),
      ),
    staleTime: 60_000,
  });
}
