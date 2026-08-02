import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import TrackClient from "./track-client";

export const metadata: Metadata = pageMetadata({
  title: "Order Tracking",
  description: "Track your Electronics Cart shipment, download invoice, and get support.",
  path: "/orders/track",
});

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-muted">
          Loading tracking…
        </div>
      }
    >
      <TrackClient />
    </Suspense>
  );
}
