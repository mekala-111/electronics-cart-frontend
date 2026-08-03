"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="RMA"
      accent="Warranty"
      path="/warranty/rma"
      description="GET /warranty/rma"
    />
  );
}
