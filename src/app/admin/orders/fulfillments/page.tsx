"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Fulfillments"
      accent="Ops"
      path="/admin/orders?page=1&limit=20"
      description="Fulfillments are created per order; orders list is the live source"
    />
  );
}
