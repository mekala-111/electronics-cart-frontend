"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AdminResourcePage } from "@/features/admin/resource-page";
import { catalogService } from "@/services/catalog.service";
import type { ApiBrand } from "@/types/catalog";

const columns: ColumnDef<ApiBrand>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "country", header: "Country" },
  { accessorKey: "status", header: "Status" },
];

export default function AdminBrandsPage() {
  return (
    <AdminResourcePage
      title="Brand"
      accent="Management"
      description="Live brands from GET /catalog/brands"
      queryKey={["admin", "brands"]}
      queryFn={async () => catalogService.brands()}
      columns={columns}
      exportName="brands"
      searchPlaceholder="Search brands…"
    />
  );
}
