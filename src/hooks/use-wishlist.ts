"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { wishlistService } from "@/services/commerce.service";
import { catalogService } from "@/services/catalog.service";
import { queryKeys } from "@/hooks/query-keys";
import { tokenStorage } from "@/api/token-storage";
import { toUiProduct } from "@/models/product";
import type { Product } from "@/types";
import { ApiError } from "@/types/api";
import type {
  WishlistDto,
  WishlistLineDisplay,
  WishlistProductMetaMap,
} from "@/types/wishlist";

const emptyWishlist = (): WishlistDto => ({
  id: "pending",
  name: "Default",
  items: [],
});

function hasAccessToken() {
  return typeof window !== "undefined" && Boolean(tokenStorage.getAccess());
}

function readMeta(qc: QueryClient): WishlistProductMetaMap {
  return qc.getQueryData<WishlistProductMetaMap>(queryKeys.wishlistProductMeta) ?? {};
}

function writeMeta(qc: QueryClient, next: WishlistProductMetaMap) {
  qc.setQueryData(queryKeys.wishlistProductMeta, next);
}

export function productToWishlistDisplay(product: Product): WishlistLineDisplay {
  return {
    productId: product.id,
    name: product.name,
    brand: product.brand,
    image: product.image,
    specs: product.specs,
    price: product.price,
    mrp: product.mrp,
    rating: product.rating,
    reviews: product.reviews,
    condition: product.condition,
  };
}

function displayToProduct(
  variantId: string,
  sku: string,
  display?: WishlistLineDisplay,
): Product {
  return {
    id: display?.productId ?? variantId,
    variantId,
    name: display?.name ?? sku,
    brand: display?.brand ?? "—",
    price: display?.price ?? 0,
    mrp: display?.mrp ?? display?.price ?? 0,
    rating: display?.rating ?? 0,
    reviews: display?.reviews ?? 0,
    condition: display?.condition ?? "—",
    specs: display?.specs ?? sku,
    image: display?.image ?? "/images/laptop.png",
  };
}

async function resolveVariantId(product: Product): Promise<string> {
  if (product.variantId) return product.variantId;
  const detail = await catalogService.product(product.id);
  const ui = toUiProduct(detail);
  if (!ui.variantId) {
    throw new ApiError({
      message: "No active variant available for this product",
      code: "MISSING_VARIANT",
      status: 404,
    });
  }
  return ui.variantId;
}

/** Auth-gated wishlist query — Nest requires Bearer (no guest wishlist). */
export function useWishlist() {
  const enabled = hasAccessToken();

  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: () => wishlistService.get(),
    enabled,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: (count, error) => {
      if (error instanceof ApiError) {
        if (error.offline || error.isUnauthorized || error.isForbidden) return false;
      }
      return count < 1;
    },
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
}

export function useWishlistProductMeta() {
  return useQuery({
    queryKey: queryKeys.wishlistProductMeta,
    queryFn: () => ({} as WishlistProductMetaMap),
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: {},
  });
}

export function useWishlistItemCount() {
  const { data, isLoading, isFetching, isError } = useWishlist();
  const count = data?.items?.length ?? 0;
  return { count, isLoading, isFetching, isError, enabled: hasAccessToken() };
}

export function useIsInWishlist(product: Product | undefined) {
  const { data } = useWishlist();
  const meta = useWishlistProductMeta();
  if (!product || !hasAccessToken()) return false;

  const items = data?.items ?? [];
  if (product.variantId && items.some((i) => i.variantId === product.variantId)) {
    return true;
  }
  const metaMap = meta.data ?? {};
  return items.some((i) => metaMap[i.variantId]?.productId === product.id);
}

/** Products for the wishlist page (API lines + display enrichment). */
export function useWishlistProducts() {
  const wishlist = useWishlist();
  const meta = useWishlistProductMeta();
  const products =
    wishlist.data?.items.map((item) =>
      displayToProduct(item.variantId, item.sku, meta.data?.[item.variantId]),
    ) ?? [];

  return {
    ...wishlist,
    products,
    count: products.length,
  };
}

export function useToggleWishlist() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!hasAccessToken()) {
        throw new ApiError({
          message: "Sign in to save items to your wishlist",
          code: "UNAUTHORIZED",
          status: 401,
        });
      }
      const variantId = await resolveVariantId(product);
      const current =
        qc.getQueryData<WishlistDto>(queryKeys.wishlist) ?? (await wishlistService.get());
      const existing = current.items.find((i) => i.variantId === variantId);
      if (existing) {
        return { wishlist: await wishlistService.remove(existing.id), added: false as const, variantId };
      }
      return { wishlist: await wishlistService.add(variantId), added: true as const, variantId };
    },
    onMutate: async (product) => {
      await qc.cancelQueries({ queryKey: queryKeys.wishlist });
      const prev = qc.getQueryData<WishlistDto>(queryKeys.wishlist);
      const variantId = product.variantId;
      const display = productToWishlistDisplay(product);

      if (variantId) {
        writeMeta(qc, { ...readMeta(qc), [variantId]: display });
        const wasIn = prev?.items.some((i) => i.variantId === variantId);
        qc.setQueryData<WishlistDto>(queryKeys.wishlist, (old) => {
          const base = old ?? emptyWishlist();
          if (wasIn) {
            return {
              ...base,
              items: base.items.filter((i) => i.variantId !== variantId),
            };
          }
          return {
            ...base,
            items: [
              ...base.items,
              {
                id: `optimistic-${variantId}`,
                variantId,
                sku: product.specs || product.id,
              },
            ],
          };
        });
      }

      return { prev };
    },
    onError: (_err, _product, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.wishlist, ctx.prev);
    },
    onSuccess: ({ wishlist, variantId }, product) => {
      writeMeta(qc, {
        ...readMeta(qc),
        [variantId]: productToWishlistDisplay(
          product.variantId ? product : { ...product, variantId },
        ),
      });
      qc.setQueryData(queryKeys.wishlist, wishlist);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.wishlist });
    },
  });
}

export function useRemoveWishlistItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => wishlistService.remove(itemId),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: queryKeys.wishlist });
      const prev = qc.getQueryData<WishlistDto>(queryKeys.wishlist);
      qc.setQueryData<WishlistDto>(queryKeys.wishlist, (old) => {
        if (!old) return old;
        return { ...old, items: old.items.filter((i) => i.id !== itemId) };
      });
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.wishlist, ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.wishlist, data);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.wishlist });
    },
  });
}

/** Prefetch helper for session restore / login */
export function prefetchWishlist(qc: QueryClient) {
  if (!hasAccessToken()) return Promise.resolve();
  return qc.prefetchQuery({
    queryKey: queryKeys.wishlist,
    queryFn: () => wishlistService.get(),
    staleTime: 30_000,
  });
}
