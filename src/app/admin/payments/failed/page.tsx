"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Failed"
      accent="Payments"
      path="/admin/payments/reports/failed"
      description="GET /admin/payments/reports/failed"
    />
  );
}
