"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Risk"
      accent="Analysis"
      path="/admin/orders?page=1&limit=5"
      description="Open an order risk via GET /admin/orders/:id/risk — listing uses recent orders"
    />
  );
}
