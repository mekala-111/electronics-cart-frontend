"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Service"
      accent="Tickets"
      path="/service/tickets"
      description="GET /service/tickets"
    />
  );
}
