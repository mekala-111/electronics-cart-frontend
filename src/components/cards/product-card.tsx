"use client";

import Link from "next/link";
import { memo, useState, useTransition } from "react";
import { Heart, Star, Timer, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { cn, formatInr } from "@/lib/utils";
import { SafeImage } from "@/components/shared/safe-image";
import { useToast } from "@/components/shared/toast";
import { Spinner } from "@/components/shared/spinner";
import { useAddToCart } from "@/hooks/use-cart";
import { useIsInWishlist, useToggleWishlist } from "@/hooks/use-wishlist";
import { ApiError } from "@/types/api";
import { tokenStorage } from "@/api/token-storage";
import { useRouter } from "next/navigation";

/** Flutter ProductCard — polished interactions, identical layout */
export const ProductCard = memo(function ProductCard({
  product,
  showTimer,
}: {
  product: Product;
  showTimer?: boolean;
}) {
  const router = useRouter();
  const toggleWishlist = useToggleWishlist();
  const wished = useIsInWishlist(product);
  const addToCart = useAddToCart();
  const toast = useToast();
  const [wishPop, setWishPop] = useState(false);
  const [pending, startTransition] = useTransition();
  const discount = Math.round(((product.mrp - product.price) / Math.max(product.mrp, 1)) * 100);
  const hot = product.badge === "Flash" || product.badge === "Hot";
  const inStock = true;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-white pb-4 shadow-[0_8px_16px_rgba(8,21,47,0.06)] transition duration-[220ms] ease-out",
        "hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-[0_12px_26px_rgba(30,94,255,0.14)]",
        "focus-within:ring-2 focus-within:ring-primary/30",
      )}
    >
      <div className="relative h-[140px] bg-[radial-gradient(circle_at_50%_30%,rgba(30,94,255,0.08),rgba(241,90,36,0.05)_45%,#F7F9FC_100%)]">
        <Link
          href={`/products/${product.id}`}
          prefetch
          className="flex h-full items-center justify-center"
        >
          <SafeImage
            src={product.image}
            alt={product.name}
            width={200}
            height={100}
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 200px"
            style={{ width: "auto", height: "auto" }}
            className="h-[100px] object-contain transition duration-[220ms] group-hover:scale-105"
          />
        </Link>
        {product.badge ? (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-[20px] px-2.5 py-1 text-[11px] font-bold text-white",
              hot ? "bg-hot" : "bg-primary",
            )}
          >
            {product.badge}
          </span>
        ) : null}
        {discount > 0 ? (
          <span className="absolute bottom-3 left-3 rounded-[12px] bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        ) : null}
        <span
          className={cn(
            "absolute bottom-3 right-3 rounded-[12px] px-2 py-0.5 text-[10px] font-bold",
            inStock ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
          )}
        >
          {inStock ? "In stock" : "Sold out"}
        </span>
        <button
          type="button"
          disabled={toggleWishlist.isPending}
          onClick={() => {
            if (!tokenStorage.getAccess()) {
              toast.info("Sign in required", "Sign in to save items to your wishlist.");
              router.push("/auth/login?next=/profile/wishlist");
              return;
            }
            const wasWished = wished;
            setWishPop(true);
            window.setTimeout(() => setWishPop(false), 320);
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
          }}
          className={cn(
            "absolute right-3 top-3 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white shadow transition",
            "hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            wishPop && "scale-125",
          )}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
        >
          <Heart
            className={cn(
              "h-[18px] w-[18px] transition duration-200",
              wished ? "fill-accent text-accent" : "text-nav-muted",
              wishPop && "scale-110",
            )}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-3.5 pt-3">
        <p className="text-[11px] font-semibold tracking-[0.8px] text-primary">
          {product.brand.toUpperCase()}
        </p>
        <Link
          href={`/products/${product.id}`}
          prefetch
          className="mt-1 line-clamp-2 text-sm font-bold leading-[1.25] text-navy hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {product.name}
        </Link>
        <p className="mt-1 truncate text-xs text-muted">{product.specs}</p>
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-navy">
          <Star className="h-[15px] w-[15px] fill-star text-star transition group-hover:scale-110" aria-hidden />
          <span aria-label={`Rated ${product.rating} out of 5 from ${product.reviews} reviews`}>
            {product.rating} ({product.reviews})
          </span>
          {product.refurbished ? (
            <span className="ml-auto text-[11px] font-semibold text-accent">{product.condition}</span>
          ) : null}
        </div>
        <div className="mt-2.5 flex flex-wrap items-end gap-2">
          <span className="text-[17px] font-extrabold text-navy">{formatInr(product.price)}</span>
          <span className="text-xs text-muted line-through">{formatInr(product.mrp)}</span>
          <span className="text-xs font-bold text-accent">-{discount}%</span>
        </div>
        {showTimer && product.dealEndsIn ? (
          <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-hot/10 px-2.5 py-2 text-xs font-semibold text-hot">
            <Timer className="h-3.5 w-3.5" aria-hidden />
            Ends in {product.dealEndsIn}
          </div>
        ) : null}
        <button
          type="button"
          disabled={pending || addToCart.isPending || !inStock}
          onClick={() => {
            startTransition(() => {
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
            });
          }}
          className={cn(
            "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-border bg-section px-3 py-2.5 text-xs font-bold text-navy transition",
            "hover:border-primary hover:bg-primary hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          {pending || addToCart.isPending ? (
            <Spinner className="h-3.5 w-3.5" label="Adding" />
          ) : (
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
          )}
          Quick add
        </button>
      </div>
    </article>
  );
});
