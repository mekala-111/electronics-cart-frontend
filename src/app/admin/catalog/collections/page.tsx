"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AdminResourcePage } from "@/features/admin/resource-page";
import { catalogService } from "@/services/catalog.service";

type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  isAutomatic?: boolean;
};

const columns: ColumnDef<CollectionRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "productCount", header: "Products" },
  {
    accessorKey: "isAutomatic",
    header: "Type",
    cell: ({ getValue }) => (getValue() ? "Automatic" : "Manual"),
  },
];

export default function AdminCollectionsPage() {
  return (
    <AdminResourcePage
      title="Collection"
      accent="Management"
      description="Live collections from GET /catalog/collections"
      queryKey={["admin", "collections"]}
      queryFn={async () => catalogService.collections() as Promise<CollectionRow[]>}
      columns={columns}
      exportName="collections"
    />
  );
}
