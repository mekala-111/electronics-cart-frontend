"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Badges"
      accent="Catalog"
      path="/admin/catalog/badges"
      description="GET /admin/catalog/badges"
    />
  );
}
