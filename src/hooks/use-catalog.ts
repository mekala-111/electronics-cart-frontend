"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog.service";
import { healthService, marketingService } from "@/services/commerce.service";
import { queryKeys } from "@/hooks/query-keys";
import { toUiProducts } from "@/models/product";
import { toUiBrands, toUiCategories } from "@/models/brand";
import { withApiFallback } from "@/lib/query-fallback";
import type { Brand, Category, Product } from "@/types";
import type { ProductSearchParams } from "@/types/catalog";
import {
  brands as mockBrands,
  categories as mockCategories,
  featuredProducts,
  flashDeals,
  refurbishedProducts,
  allProducts,
} from "@/lib/mock-data";

const staleCatalog = 5 * 60_000;
const staleTaxonomy = 15 * 60_000;

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () =>
      withApiFallback(healthService.check, { status: "degraded" }),
    staleTime: 30_000,
    retry: 2,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands,
    queryFn: async () => {
      const result = await withApiFallback(
        async () => toUiBrands(await catalogService.brands()),
        mockBrands,
        { treatEmptyAsFallback: true },
      );
      return result;
    },
    staleTime: staleTaxonomy,
    retry: 2,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const result = await withApiFallback(
        async () => toUiCategories(await catalogService.categories()),
        mockCategories,
        { treatEmptyAsFallback: true },
      );
      return result;
    },
    staleTime: staleTaxonomy,
    retry: 2,
  });
}

export function useProducts(params?: ProductSearchParams) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: async () => {
      const fallbackItems = filterMockProducts(allProducts, params);
      const result = await withApiFallback(
        async () => {
          const res = await catalogService.products(params);
          return {
            items: toUiProducts(res.items),
            meta: res.meta,
          };
        },
        {
          items: fallbackItems,
          meta: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: fallbackItems.length,
          },
        },
        {
          treatEmptyAsFallback: true,
          isEmpty: (v) => v.items.length === 0,
        },
      );
      return result;
    },
    staleTime: staleCatalog,
    retry: 2,
  });
}

function productListQuery(
  key: readonly unknown[],
  fetcher: () => Promise<{ items: Product[] }>,
  fallback: Product[],
) {
  return {
    queryKey: key,
    queryFn: async () =>
      withApiFallback(
        async () => {
          const res = await fetcher();
          return res.items;
        },
        fallback,
        { treatEmptyAsFallback: true },
      ),
    staleTime: staleCatalog,
    retry: 2,
  };
}

export function useFeaturedProducts() {
  return useQuery(
    productListQuery(
      queryKeys.featured,
      async () => {
        const res = await catalogService.featured();
        return { items: toUiProducts(res.items) };
      },
      featuredProducts,
    ),
  );
}

export function useRefurbishedProducts() {
  return useQuery(
    productListQuery(
      queryKeys.refurbished,
      async () => {
        const res = await catalogService.refurbished();
        return { items: toUiProducts(res.items) };
      },
      refurbishedProducts,
    ),
  );
}

export function useNewestProducts() {
  return useQuery(
    productListQuery(
      queryKeys.newest,
      async () => {
        const res = await catalogService.newest();
        return { items: toUiProducts(res.items) };
      },
      featuredProducts,
    ),
  );
}

export function useFlashDeals() {
  return useQuery(
    productListQuery(
      queryKeys.flash,
      async () => {
        const res = await catalogService.products({
          refurbished: true,
          sort: "price_asc",
          limit: 8,
        });
        return {
          items: toUiProducts(res.items).map((p) => ({
            ...p,
            badge: p.badge ?? "Flash",
            dealEndsIn: p.dealEndsIn ?? "05:00:00",
          })),
        };
      },
      flashDeals,
    ),
  );
}

export function useProduct(idOrSlug: string) {
  const fallback = allProducts.find((p) => p.id === idOrSlug) ?? allProducts[0];
  return useQuery({
    queryKey: queryKeys.product(idOrSlug),
    queryFn: async () =>
      withApiFallback(
        async () => toUiProducts([await catalogService.product(idOrSlug)])[0],
        fallback,
      ),
    enabled: Boolean(idOrSlug),
    staleTime: staleCatalog,
    retry: 2,
  });
}

export function useRecommendations(params?: { productId?: string; type?: string }) {
  return useQuery({
    queryKey: queryKeys.recommendations(params),
    queryFn: async () =>
      withApiFallback(
        async () => toUiProducts(await marketingService.recommendations(params)),
        allProducts.filter((p) => p.id !== params?.productId).slice(0, 4),
        { treatEmptyAsFallback: true },
      ),
    staleTime: staleCatalog,
    retry: 2,
  });
}

export function useBanners() {
  return useQuery({
    queryKey: queryKeys.banners,
    queryFn: async () =>
      withApiFallback(marketingService.banners, [] as unknown[], {
        treatEmptyAsFallback: false,
      }),
    staleTime: staleTaxonomy,
    retry: 1,
  });
}

function filterMockProducts(list: Product[], params?: ProductSearchParams): Product[] {
  let items = [...list];
  if (params?.q) {
    const q = params.q.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.specs.toLowerCase().includes(q),
    );
  }
  if (params?.brandSlug) {
    items = items.filter((p) => p.brand.toLowerCase() === params.brandSlug?.toLowerCase());
  }
  if (params?.categorySlug) {
    items = items.filter(
      (p) => p.category?.toLowerCase() === params.categorySlug?.toLowerCase(),
    );
  }
  if (params?.refurbished) items = items.filter((p) => p.refurbished);
  if (params?.featured) items = items.filter((p) => Boolean(p.badge));
  if (params?.newArrival) items = items.filter((p) => !p.refurbished);
  if (params?.maxPrice != null) items = items.filter((p) => p.price <= params.maxPrice!);
  if (params?.minPrice != null) items = items.filter((p) => p.price >= params.minPrice!);
  if (params?.condition) {
    items = items.filter((p) => p.condition.toLowerCase() === params.condition!.toLowerCase());
  }
  if (params?.sort === "price_asc") items.sort((a, b) => a.price - b.price);
  if (params?.sort === "price_desc") items.sort((a, b) => b.price - a.price);
  if (params?.sort === "rating") items.sort((a, b) => b.rating - a.rating);
  const page = params?.page ?? 1;
  const limit = params?.limit ?? items.length;
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

export type { Brand, Category, Product };
