"use client";

import { AdminLiveJsonPage } from "@/features/admin/live-json-page";

export default function Page() {
  return (
    <AdminLiveJsonPage
      title="Coupons"
      accent="Marketing"
      path="/admin/marketing/dashboard"
      description="Coupon create is POST; marketing dashboard is live"
    />
  );
}
