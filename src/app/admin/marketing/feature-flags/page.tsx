"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Feature"
      accent="Flags"
      path="/feature-flags"
      description="GET /feature-flags"
    />
  );
}
