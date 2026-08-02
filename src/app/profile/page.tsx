"use client";

import Link from "next/link";
import { ProfileShell } from "@/features/profile/profile-shell";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/shared/require-auth";
import { QueryState } from "@/components/shared/query-state";
import { useOrders } from "@/hooks/use-orders";
import { useWishlistItemCount } from "@/hooks/use-wishlist";

export default function ProfileDashboardPage() {
  const orders = useOrders();
  const { count: wishlistCount } = useWishlistItemCount();
  const orderCount = orders.data?.length ?? 0;
  const latest = orders.data?.[0];
  const latestRef = latest?.orderNumber || latest?.id;

  return (
    <RequireAuth>
      <ProfileShell title="Your Dashboard">
        <QueryState
          className="mb-4"
          isLoading={orders.isLoading && !orders.data}
          isError={orders.isError}
          error={orders.error}
          onRetry={() => void orders.refetch()}
          skeleton={
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-[18px] border border-border bg-section"
                />
              ))}
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Orders", value: String(orderCount), href: "/profile/orders" },
              { label: "Wishlist", value: String(wishlistCount), href: "/profile/wishlist" },
              { label: "Open tickets", value: "—", href: "/profile/support" },
            ].map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="rounded-[18px] border border-border bg-section p-5 transition hover:border-primary/40"
              >
                <p className="text-sm text-muted">{c.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-navy">{c.value}</p>
              </Link>
            ))}
          </div>
        </QueryState>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={
              latestRef
                ? `/orders/track?order=${encodeURIComponent(latestRef)}`
                : "/profile/orders"
            }
          >
            <Button>Track latest order</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Continue shopping</Button>
          </Link>
        </div>
      </ProfileShell>
    </RequireAuth>
  );
}
