"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Stock"
      accent="Adjustments"
      path="/admin/inventory/low-stock-alerts"
      description="Adjustments are write APIs; live inventory auth check"
    />
  );
}
