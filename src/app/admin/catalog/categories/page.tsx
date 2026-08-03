"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AdminResourcePage } from "@/features/admin/resource-page";
import { catalogService } from "@/services/catalog.service";
import type { ApiCategory } from "@/types/catalog";

const columns: ColumnDef<ApiCategory>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "sortOrder", header: "Sort" },
  { accessorKey: "status", header: "Status" },
];

export default function AdminCategoriesPage() {
  return (
    <AdminResourcePage
      title="Category"
      accent="Tree"
      description="Live categories from GET /catalog/categories"
      queryKey={["admin", "categories"]}
      queryFn={async () => catalogService.categories()}
      columns={columns}
      exportName="categories"
      searchPlaceholder="Search categories…"
    />
  );
}
