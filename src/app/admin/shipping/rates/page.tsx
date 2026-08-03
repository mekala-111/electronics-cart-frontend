"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Rates"
      accent="Shipping"
      path="/shipping/methods"
      description="Public shipping methods for rate context"
    />
  );
}
