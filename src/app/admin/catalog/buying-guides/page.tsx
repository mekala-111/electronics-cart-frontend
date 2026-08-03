"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Buying"
      accent="Guides"
      path="/admin/catalog/buying-guides"
      description="GET /admin/catalog/buying-guides"
    />
  );
}
