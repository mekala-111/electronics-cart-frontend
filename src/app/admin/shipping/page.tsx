"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Shipments"
      accent="Ops"
      path="/admin/shipping/logs"
      description="GET /admin/shipping/logs"
    />
  );
}
