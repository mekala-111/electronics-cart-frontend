"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AdminResourcePage } from "@/features/admin/resource-page";
import { adminService } from "@/services/commerce.service";

type Row = Record<string, unknown> & { id?: string };

const columns: ColumnDef<Row>[] = [
  {
    id: "sku",
    header: "SKU",
    accessorFn: (r) => String(r.sku ?? r.variantSku ?? r.productName ?? "—"),
  },
  {
    id: "available",
    header: "Available",
    accessorFn: (r) => Number(r.available ?? r.availableQuantity ?? 0),
  },
  {
    id: "reorder",
    header: "Reorder level",
    accessorFn: (r) => String(r.reorderLevel ?? r.minQty ?? "—"),
  },
  {
    id: "warehouse",
    header: "Warehouse",
    accessorFn: (r) => String(r.warehouseCode ?? r.warehouseId ?? "—"),
  },
];

export default function AdminLowStockPage() {
  return (
    <AdminResourcePage
      title="Low Stock"
      accent="Alerts"
      description="Live alerts from GET /admin/inventory/low-stock-alerts"
      queryKey={["admin", "low-stock"]}
      queryFn={async () => {
        const rows = await adminService.lowStock();
        return (Array.isArray(rows) ? rows : []) as Row[];
      }}
      columns={columns}
      exportName="low-stock"
    />
  );
}
