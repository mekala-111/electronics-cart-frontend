import { apiGet, apiGetPaginated } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  ApiBrand,
  ApiCategory,
  ApiCategoryTreeNode,
  ApiProductDetail,
  ApiProductListItem,
  ProductSearchParams,
} from "@/types/catalog";
import type { PaginationMeta } from "@/types/api";

function boolParam(v?: boolean) {
  if (v === undefined) return undefined;
  return v ? "true" : "false";
}

function searchParams(params?: ProductSearchParams) {
  if (!params) return undefined;
  return {
    ...params,
    featured: boolParam(params.featured),
    refurbished: boolParam(params.refurbished),
    newArrival: boolParam(params.newArrival),
  };
}

export const catalogService = {
  brands: () => apiGet<ApiBrand[]>(endpoints.catalog.brands),
  categories: () => apiGet<ApiCategory[]>(endpoints.catalog.categories),
  categoryTree: () => apiGet<ApiCategoryTreeNode[]>(endpoints.catalog.categoryTree),
  products: (params?: ProductSearchParams) =>
    apiGetPaginated<ApiProductListItem>(endpoints.catalog.products, searchParams(params)),
  search: (params?: ProductSearchParams) =>
    apiGetPaginated<ApiProductListItem>(endpoints.catalog.search, searchParams(params)),
  featured: () => apiGetPaginated<ApiProductListItem>(endpoints.catalog.featured),
  newest: () => apiGetPaginated<ApiProductListItem>(endpoints.catalog.newest),
  refurbished: () => apiGetPaginated<ApiProductListItem>(endpoints.catalog.refurbished),
  product: (idOrSlug: string) => apiGet<ApiProductDetail>(endpoints.catalog.product(idOrSlug)),
};

export type CatalogListResult = {
  items: ApiProductListItem[];
  meta?: PaginationMeta;
};
