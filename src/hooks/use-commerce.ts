"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/commerce.service";
import { catalogService } from "@/services/catalog.service";
import { queryKeys } from "@/hooks/query-keys";
import { withApiFallback } from "@/lib/query-fallback";
import {
  mockAdminKpis,
  mockAdminOrders,
  mockCustomers,
  mockInvoices,
  mockInventory,
} from "@/lib/fallbacks";
import { allProducts } from "@/lib/mock-data";
import { toUiProducts } from "@/models/product";
import { formatInr } from "@/lib/utils";
import type { OrderSummary } from "@/types/orders";

function formatCompactInr(n: number) {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return formatInr(n);
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: async () => {
      const [raw, marketing, products, customers, inventory, lowStock, warehouses] =
        await Promise.all([
          adminService.dashboard().catch(() => null),
          adminService.marketingDashboard().catch(() => null),
          adminService.products({ page: 1, limit: 1 }).catch(() => ({ items: [], meta: undefined })),
          adminService.customers({ page: 1, limit: 1 }).catch(() => ({ items: [], meta: undefined })),
          adminService.inventoryRows({ page: 1, limit: 100 }).catch(() => ({ items: [] as unknown[] })),
          adminService.lowStock().catch(() => []),
          adminService.warehouses().catch(() => []),
        ]);

      const widgets = extractWidgets(raw);
      const kpis = extractDashboardKpis(raw);
      const series = extractSalesSeriesRaw(raw);
      const orderStatus = extractNamedCounts(raw, "orders");
      const inventoryBreakdown = extractNamedCounts(raw, "inventory");
      const units = (inventory.items as Array<{ available?: number }>).reduce(
        (s, r) => s + Number(r.available ?? 0),
        0,
      );
      const mkt = (marketing ?? {}) as Record<string, number>;

      return {
        kpis,
        series,
        widgets,
        orderStatus,
        inventoryBreakdown,
        totals: {
          products: products.meta?.total ?? products.items.length,
          customers: customers.meta?.total ?? customers.items.length,
          lowStock: Array.isArray(lowStock) ? lowStock.length : 0,
          units,
          warehouses: warehouses.length,
          activeCoupons: Number(mkt.activeCoupons ?? 0),
          campaigns: Number(mkt.runningEmailCampaigns ?? 0),
          featureFlags: Number(mkt.featureFlags ?? 0),
        },
        lowStockRows: Array.isArray(lowStock) ? lowStock : [],
        inventoryRows: inventory.items as Array<{
          sku?: string;
          available?: number;
          warehouseCode?: string;
          reorderLevel?: number;
        }>,
      };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

function extractWidgets(raw: unknown) {
  if (!raw || typeof raw !== "object") return [];
  const widgets = (raw as { widgets?: unknown }).widgets;
  return Array.isArray(widgets) ? widgets : [];
}

function extractSalesSeriesRaw(raw: unknown): Array<{ label: string; revenue: number; orders: number }> {
  const widgets = extractWidgets(raw) as Array<{ code?: string; data?: { series?: unknown[] } }>;
  const sales = widgets.find((w) => w.code === "sales_summary" || Array.isArray(w.data?.series));
  const series = sales?.data?.series;
  if (!Array.isArray(series)) return [];
  return series.map((row, i) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      label: String(r.date ?? r.day ?? r.label ?? `D${i + 1}`),
      revenue: Number(r.revenue ?? r.value ?? 0),
      orders: Number(r.orders_count ?? r.orders ?? 0),
    };
  });
}

function extractNamedCounts(raw: unknown, kind: "orders" | "inventory") {
  // Derive simple buckets from widget data when present; otherwise empty.
  const widgets = extractWidgets(raw) as Array<{ code?: string; data?: Record<string, unknown> }>;
  if (kind === "inventory") {
    const inv = widgets.find((w) => w.code === "inventory_summary");
    if (!inv?.data) return [];
    return [
      { name: "On hand", value: Number(inv.data.onHand ?? 0) },
      { name: "Low stock", value: Number(inv.data.lowStock ?? 0) },
      { name: "Stockout", value: Number(inv.data.stockout ?? 0) },
    ].filter((x) => x.value > 0);
  }
  return [];
}

function extractDashboardKpis(
  raw: unknown,
): Array<{ label: string; value: string }> {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.kpis) && obj.kpis.length) {
    return obj.kpis as Array<{ label: string; value: string }>;
  }
  const widgets = Array.isArray(obj.widgets) ? obj.widgets : [];
  const out: Array<{ label: string; value: string }> = [];
  for (const w of widgets) {
    if (!w || typeof w !== "object") continue;
    const widget = w as { title?: string; type?: string; data?: Record<string, unknown> };
    const data = widget.data ?? {};
    if (widget.type === "kpi" || data.revenue != null || data.orders != null || data.captured != null) {
      if (typeof data.revenue === "number") {
        out.push({ label: "Revenue", value: formatCompactInr(data.revenue) });
      }
      if (typeof data.orders === "number") {
        out.push({ label: "Orders", value: data.orders.toLocaleString("en-IN") });
      }
      if (typeof data.aov === "number") {
        out.push({ label: "AOV", value: formatCompactInr(data.aov) });
      }
      if (typeof data.captured === "number") {
        out.push({ label: "Captured", value: formatCompactInr(data.captured) });
      }
      if (typeof data.onHand === "number" || typeof data.units_on_hand === "number") {
        out.push({
          label: "Units on hand",
          value: String(data.onHand ?? data.units_on_hand),
        });
      }
      if (typeof data.lowStock === "number" || typeof data.low_stock_skus === "number") {
        out.push({
          label: "Low stock",
          value: String(data.lowStock ?? data.low_stock_skus),
        });
      }
    }
  }
  // de-dupe by label
  const seen = new Set<string>();
  return out.filter((k) => {
    if (seen.has(k.label)) return false;
    seen.add(k.label);
    return true;
  }).slice(0, 4);
}

function extractSalesSeries(raw: unknown): number[] {
  return extractSalesSeriesRaw(raw).map((r) => r.revenue);
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
            limit: 50,
            status: nestStatus && nestStatus !== "all" ? nestStatus : undefined,
          });
          return (res.items as Array<OrderSummary & { customer?: string }>).map((o) => ({
            id: o.orderNumber || o.id,
            orderId: o.id,
            customer: o.customer || "—",
            total: o.grandTotal,
            status: o.status,
          }));
        },
        mockAdminOrders
          .filter((o) => !status || status === "All" || o.status.toLowerCase() === status.toLowerCase())
          .map((o) => ({ ...o, orderId: o.id })),
        { treatEmptyAsFallback: true },
      ),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAdminCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      adminService.cancelOrder(id, note ? { note } : undefined),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

export function useAdminCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => adminService.createInvoice(orderId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "invoices"] });
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

export function useAdminProducts(params?: { q?: string; brandId?: string }) {
  return useQuery({
    queryKey: queryKeys.adminProducts(params),
    queryFn: async () =>
      withApiFallback(
        async () => {
          const res = await adminService.products({
            page: 1,
            limit: 100,
            q: params?.q || undefined,
            brandId: params?.brandId || undefined,
          });
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
          const [alerts, warehouses, rows] = await Promise.all([
            adminService.lowStock().catch(() => []),
            adminService.warehouses().catch(() => []),
            adminService.inventoryRows({ page: 1, limit: 100 }).catch(() => ({ items: [] as unknown[] })),
          ]);
          const lowStock = Array.isArray(alerts) ? alerts.length : 0;
          const units = (rows.items as Array<{ available?: number }>).reduce(
            (s, r) => s + Number(r.available ?? 0),
            0,
          );
          const warehouseNames = (warehouses as Array<{ name?: string; code?: string }>).map(
            (w) => w.name || w.code || "Warehouse",
          );
          return {
            units,
            warehouses: warehouseNames,
            lowStock,
            rows: rows.items as Array<{
              sku?: string;
              available?: number;
              reserved?: number;
              warehouseCode?: string;
            }>,
            alerts: Array.isArray(alerts) ? alerts : [],
          };
        },
        { ...mockInventory, rows: [], alerts: [] },
      ),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: queryKeys.adminCustomers,
    queryFn: async () =>
      withApiFallback(
        async () => {
          const res = await adminService.customers({ page: 1, limit: 100 });
          return (res.items as Array<{
            name: string;
            email?: string | null;
            orders: number;
            ltv: number;
          }>).map((c) => ({
            name: c.name,
            email: c.email || "—",
            orders: c.orders,
            ltv: c.ltv,
          }));
        },
        mockCustomers.map((c) => ({ ...c })),
        { treatEmptyAsFallback: true },
      ),
    staleTime: 60_000,
  });
}

export function useAdminInvoices() {
  return useQuery({
    queryKey: queryKeys.adminInvoices,
    queryFn: async () =>
      withApiFallback(
        async () => {
          const res = await adminService.invoices({ page: 1, limit: 50 });
          return (res.items as Array<{
            invoiceNumber: string;
            orderNumber?: string;
            grandTotal: number;
          }>).map((i) => ({
            id: i.invoiceNumber,
            order: i.orderNumber || "—",
            amount: i.grandTotal,
          }));
        },
        mockInvoices.map((i) => ({ ...i })),
        { treatEmptyAsFallback: true },
      ),
    staleTime: 60_000,
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: queryKeys.adminReports,
    queryFn: async () => {
      const [funnels, trends, reports] = await Promise.all([
        adminService.funnels().catch(() => null),
        adminService.trends({ domain: "sales", days: 30 }).catch(() => null),
        adminService.reports().catch(() => []),
      ]);
      return { funnels, trends, reports: Array.isArray(reports) ? reports : [] };
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: queryKeys.adminSettings,
    queryFn: () => adminService.settings(),
    staleTime: 60_000,
  });
}

export function useUpdateAdminSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminService.updateSettings,
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.adminSettings }),
  });
}

export function useAdminCatalogMeta() {
  return useQuery({
    queryKey: ["admin", "catalog-meta"],
    queryFn: async () => {
      const [brands, categories, productTypes] = await Promise.all([
        catalogService.brands(),
        catalogService.categories(),
        catalogService.productTypes(),
      ]);
      return { brands, categories, productTypes };
    },
    staleTime: 120_000,
  });
}

export function useSaveAdminProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      product: Record<string, unknown>;
      variant?: Record<string, unknown>;
      images?: File[];
    }) => {
      let productId = input.id;
      if (productId) {
        await adminService.updateProduct(productId, input.product);
      } else {
        const created = (await adminService.createProduct(input.product)) as { id: string };
        productId = created.id;
        if (input.variant) {
          await adminService.createVariant({ ...input.variant, productId });
        }
      }
      if (input.images?.length) {
        for (let i = 0; i < input.images.length; i++) {
          const uploaded = await adminService.uploadMedia(input.images[i]);
          await adminService.attachProductMedia(productId!, {
            mediaFileId: uploaded.id,
            isPrimary: i === 0 && !input.id,
            sortOrder: i,
          });
        }
      }
      return productId!;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      void qc.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
}
