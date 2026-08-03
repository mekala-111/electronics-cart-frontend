"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Media"
      accent="Gallery"
      path="/admin/catalog/badges"
      description="Media is attached per product; badges endpoint confirms catalog-admin auth"
    />
  );
}
