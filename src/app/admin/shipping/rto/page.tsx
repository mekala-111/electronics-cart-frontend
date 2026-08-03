"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="RTO"
      accent="Shipping"
      path="/admin/shipping/logs"
      description="RTO is POST; webhook/logs confirm shipping admin access"
    />
  );
}
