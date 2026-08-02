"use client";

import Link from "next/link";
import { ProfileShell } from "@/features/profile/profile-shell";
import { ProductCard } from "@/components/product/product-card";
import { RequireAuth } from "@/components/shared/require-auth";
import { QueryState } from "@/components/shared/query-state";
import { CtaButton } from "@/components/shared/cta-button";
import { useWishlistProducts } from "@/hooks/use-wishlist";

export default function WishlistPage() {
  const remote = useWishlistProducts();

  return (
    <RequireAuth>
      <ProfileShell title="Wishlist">
        <QueryState
          isLoading={remote.isLoading && !remote.data}
          isFetching={remote.isFetching}
          isError={remote.isError}
          error={remote.error}
          onRetry={() => void remote.refetch()}
          skeleton={
            <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-[24px] border border-border bg-section"
                />
              ))}
            </div>
          }
        >
          {remote.products.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-border bg-white p-8 text-center">
              <p className="text-base font-bold text-navy">No saved items yet</p>
              <p className="mt-1 text-sm text-muted">Heart a product to add it here.</p>
              <Link href="/products" className="mt-4 inline-block">
                <CtaButton label="Browse Products" className="!px-4 !py-2 text-sm" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
              {remote.products.map((p) => (
                <ProductCard key={p.variantId ?? p.id} product={p} />
              ))}
            </div>
          )}
        </QueryState>
      </ProfileShell>
    </RequireAuth>
  );
}
