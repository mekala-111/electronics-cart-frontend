"use client";

import { useEffect, useState } from "react";
import { Heart, Shield, Truck, RotateCcw, Star, ZoomIn, CreditCard } from "lucide-react";
import { StoreChrome } from "@/components/layout/store-chrome";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionTitle } from "@/components/shared/section-title";
import { ProductCard } from "@/components/cards/product-card";
import { CtaButton } from "@/components/shared/cta-button";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { SafeImage } from "@/components/shared/safe-image";
import { useToast } from "@/components/shared/toast";
import { allProducts } from "@/lib/mock-data";
import { formatInr, cn } from "@/lib/utils";
import { useRecentlyViewedStore } from "@/store";
import { useProduct, useRecommendations } from "@/hooks/use-catalog";
import { useAddToCart } from "@/hooks/use-cart";
import { useIsInWishlist, useToggleWishlist } from "@/hooks/use-wishlist";
import { ApiError } from "@/types/api";
import { tokenStorage } from "@/api/token-storage";
import { useRouter } from "next/navigation";

export function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const productQuery = useProduct(id);
  const product = productQuery.data?.data ?? allProducts.find((p) => p.id === id) ?? allProducts[0];
  const relatedQuery = useRecommendations({ productId: product.id, type: "related" });
  const related =
    relatedQuery.data?.data?.length
      ? relatedQuery.data.data
      : allProducts.filter((p) => p.id !== product.id && p.brand === product.brand).slice(0, 4);
  const [tab, setTab] = useState("specs");
  const [zoom, setZoom] = useState(false);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const pushRecent = useRecentlyViewedStore((s) => s.push);
  const wished = useIsInWishlist(product);
  const toast = useToast();
  const discount = Math.round(((product.mrp - product.price) / Math.max(product.mrp, 1)) * 100);
  const emi = Math.round(product.price / 12);

  const handleAddToCart = () => {
    addToCart.mutate(
      { product, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart", product.name),
        onError: (err) => {
          toast.error(
            "Could not add to cart",
            err instanceof ApiError ? err.message : "Please try again",
          );
        },
      },
    );
  };

  const handleToggleWishlist = () => {
    if (!tokenStorage.getAccess()) {
      toast.info("Sign in required", "Sign in to save items to your wishlist.");
      router.push("/auth/login?next=/profile/wishlist");
      return;
    }
    const wasWished = wished;
    toggleWishlist.mutate(product, {
      onSuccess: (res) => {
        toast.success(
          res.added ? "Saved to wishlist" : "Removed from wishlist",
          product.name,
        );
      },
      onError: (err) => {
        toast.error(
          wasWished ? "Could not remove" : "Could not save",
          err instanceof ApiError ? err.message : "Please try again",
        );
      },
    });
  };

  useEffect(() => {
    pushRecent(product.id);
  }, [product.id, pushRecent]);

  return (
    <StoreChrome>
      <PageShell className="section-pad pb-28">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.name },
          ]}
        />
        <LiveDataBanner show={productQuery.data?.degraded} className="mb-4" />
        {productQuery.isLoading && !productQuery.data ? (
          <div className="mb-6 h-80 animate-pulse rounded-[28px] border border-border bg-section" />
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_50%_30%,rgba(30,94,255,0.08),rgba(241,90,36,0.05)_45%,#F7F9FC_100%)] p-8">
            <button
              type="button"
              onClick={() => setZoom(!zoom)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={zoom ? "Zoom out" : "Zoom image"}
            >
              <ZoomIn className="h-4 w-4 text-navy" />
            </button>
            <SafeImage
              src={product.image}
              alt={product.name}
              width={720}
              height={480}
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className={cn(
                "mx-auto h-auto w-full max-w-lg object-contain transition duration-300",
                zoom && "scale-125 cursor-zoom-out",
              )}
            />
          </div>

          <div className="lg:sticky lg:top-[110px] lg:self-start">
            <div className="rounded-[24px] border border-border bg-white p-6 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
              <p className="text-xs font-bold tracking-[0.8px] text-primary">{product.brand.toUpperCase()}</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy md:text-3xl">
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-navy">
                <Star className="h-4 w-4 fill-star text-star" />
                {product.rating} · {product.reviews} reviews
                {product.refurbished ? (
                  <span className="ml-2 rounded-full bg-accent/10 px-2.5 py-1 text-xs text-accent">
                    {product.condition}
                  </span>
                ) : null}
              </div>
              <div className="mt-5 flex items-end gap-3">
                <span className="text-3xl font-extrabold text-navy">{formatInr(product.price)}</span>
                <span className="pb-1 text-muted line-through">{formatInr(product.mrp)}</span>
                <span className="pb-1 font-bold text-accent">-{discount}%</span>
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <CreditCard className="h-4 w-4 text-primary" />
                EMI from {formatInr(emi)}/mo · No-cost EMI available
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {product.specs}. Certified quality with transparent grading, 1-year warranty, and insured delivery.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: "1 Year Warranty" },
                  { icon: Truck, label: "Fast Delivery" },
                  { icon: RotateCcw, label: "7-Day Returns" },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="rounded-[18px] border border-border bg-section p-3 text-center"
                  >
                    <t.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                    <p className="text-[11px] font-semibold text-navy">{t.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 hidden gap-3 md:flex">
                <CtaButton
                  label={addToCart.isPending ? "Adding…" : "Add to Cart"}
                  className="flex-1"
                  loading={addToCart.isPending}
                  onClick={handleAddToCart}
                />
                <button
                  type="button"
                  disabled={toggleWishlist.isPending}
                  onClick={handleToggleWishlist}
                  aria-label="Toggle wishlist"
                  aria-pressed={wished}
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px] border border-border hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Heart className={cn("h-5 w-5", wished && "fill-accent text-accent")} />
                </button>
              </div>
              <button
                type="button"
                className="mt-3 hidden w-full rounded-[16px] border-[1.5px] border-primary px-7 py-4 text-[15px] font-semibold tracking-[0.2px] text-primary transition hover:bg-primary/5 md:inline-flex md:items-center md:justify-center"
                onClick={handleAddToCart}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex flex-wrap gap-2 border-b border-border" role="tablist">
            {[
              ["specs", "Specifications"],
              ["overview", "Overview"],
              ["warranty", "Warranty"],
              ["reviews", "Reviews"],
              ["qa", "Questions"],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={cn(
                  "border-b-2 px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  tab === k ? "border-primary text-primary" : "border-transparent text-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-[24px] border border-border bg-white p-6 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
            {tab === "specs" ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Brand", product.brand],
                  ["Specs", product.specs],
                  ["Condition", product.condition],
                  ["Category", product.category ?? "Laptops"],
                  ["Battery Health", "92%"],
                  ["Warranty", "12 months"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-divider py-2 text-sm">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-semibold text-navy">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {tab === "overview" ? (
              <p className="text-sm leading-relaxed text-muted">
                Premium {product.brand} device curated for Electronics Cart. Fully tested across display,
                keyboard, ports, storage health, and thermal performance.
              </p>
            ) : null}
            {tab === "warranty" ? (
              <p className="text-sm leading-relaxed text-muted">
                Covered by Electronics Cart 1-year warranty for hardware defects. Easy claim via Support Tickets.
              </p>
            ) : null}
            {tab === "reviews" ? (
              <p className="text-sm text-muted">
                {product.reviews} verified reviews · Average {product.rating}/5
              </p>
            ) : null}
            {tab === "qa" ? (
              <p className="text-sm text-muted">
                Ask about battery health, GPU, or delivery windows — our team replies within 24h.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-14">
          <SectionTitle title="Related Products" accentWord="Products" />
          <div className="mt-8 grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </PageShell>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-4 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-navy">{product.name}</p>
            <p className="font-extrabold text-primary">{formatInr(product.price)}</p>
          </div>
          <CtaButton
            label={addToCart.isPending ? "Adding…" : "Add to Cart"}
            loading={addToCart.isPending}
            onClick={handleAddToCart}
          />
        </div>
      </div>
    </StoreChrome>
  );
}
