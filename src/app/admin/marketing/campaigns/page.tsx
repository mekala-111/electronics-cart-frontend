"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Campaigns"
      accent="Marketing"
      path="/admin/marketing/dashboard"
      description="Campaign create is POST; marketing dashboard is live"
    />
  );
}
