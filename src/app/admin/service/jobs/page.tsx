"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Service"
      accent="Jobs"
      path="/admin/service/dashboard"
      description="Jobs are write-oriented; dashboard is live"
    />
  );
}
