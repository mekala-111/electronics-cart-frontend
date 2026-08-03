"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Payments"
      accent="Inbox"
      path="/admin/payments/settlements/list"
      description="GET /admin/payments/settlements/list"
    />
  );
}
