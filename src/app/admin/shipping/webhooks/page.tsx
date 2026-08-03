"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Webhook"
      accent="Logs"
      path="/admin/shipping/webhooks"
      description="GET /admin/shipping/webhooks"
    />
  );
}
