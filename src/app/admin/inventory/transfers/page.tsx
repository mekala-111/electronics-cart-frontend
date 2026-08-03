"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Stock"
      accent="Transfers"
      path="/admin/inventory/low-stock-alerts"
      description="Transfers are write APIs; low-stock confirms inventory-admin access"
    />
  );
}
