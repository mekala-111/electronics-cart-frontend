"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Goods"
      accent="Receipts"
      path="/admin/inventory/purchase-orders"
      description="GRN create is POST; PO list confirms inventory read access"
    />
  );
}
