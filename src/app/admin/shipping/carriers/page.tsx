"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Carriers"
      accent="Shipping"
      path="/admin/shipping/logs"
      description="Carrier create is POST; logs confirm shipping-admin access"
    />
  );
}
