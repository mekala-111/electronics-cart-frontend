"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Purchase"
      accent="Orders"
      path="/admin/inventory/purchase-orders"
      description="GET /admin/inventory/purchase-orders"
    />
  );
}
