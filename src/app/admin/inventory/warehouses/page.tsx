"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AdminResourcePage } from "@/features/admin/resource-page";
import { adminService } from "@/services/commerce.service";

type Row = { id: string; name?: string; code?: string; city?: string; state?: string; status?: string };

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "code", header: "Code" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "state", header: "State" },
  { accessorKey: "status", header: "Status" },
];

export default function AdminWarehousesPage() {
  return (
    <AdminResourcePage
      title="Warehouse"
      accent="Network"
      description="Live warehouses from GET /inventory/warehouses"
      queryKey={["admin", "warehouses"]}
      queryFn={async () => adminService.warehouses() as Promise<Row[]>}
      columns={columns}
      exportName="warehouses"
    />
  );
}
