"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Disputes"
      accent="Finance"
      path="/admin/payments/disputes"
      description="GET /admin/payments/disputes"
    />
  );
}
