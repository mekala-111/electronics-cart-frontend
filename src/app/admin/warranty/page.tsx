"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Warranty"
      accent="Plans"
      path="/warranty/plans"
      description="GET /warranty/plans"
    />
  );
}
