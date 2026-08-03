"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AdminResourcePage } from "@/features/admin/resource-page";
import { catalogService } from "@/services/catalog.service";
import { formatInr } from "@/lib/utils";
import type { ApiProductListItem } from "@/types/catalog";

const columns: ColumnDef<ApiProductListItem>[] = [
  { accessorKey: "name", header: "Product" },
  {
    id: "brand",
    header: "Brand",
    accessorFn: (r) => r.brand?.name ?? "—",
  },
  {
    id: "price",
    header: "From",
    accessorFn: (r) => r.priceFrom ?? 0,
    cell: ({ getValue }) => formatInr(Number(getValue() ?? 0)),
  },
  { accessorKey: "stockStatus", header: "Stock" },
];

export default function AdminVariantsPage() {
  return (
    <AdminResourcePage
      title="Variants"
      accent="Catalog"
      description="Variant pricing/stock surfaces via live catalog products until a dedicated variants list API exists"
      queryKey={["admin", "variants-via-products"]}
      queryFn={async () => {
        const res = await catalogService.products({ page: 1, limit: 100 });
        return res.items;
      }}
      columns={columns}
      exportName="variants"
      createHref="/admin/products/new"
      createLabel="Add product"
    />
  );
}
