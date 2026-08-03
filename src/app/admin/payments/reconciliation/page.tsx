"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Reconciliation"
      accent="Finance"
      path="/admin/payments/reconciliation/list"
      description="GET /admin/payments/reconciliation/list"
    />
  );
}
