import { apiGet, apiMutate } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { tokenStorage } from "@/api/token-storage";
import { addressesService } from "@/services/addresses.service";
import type { CartDto } from "@/types/cart";
import type { WishlistDto } from "@/types/wishlist";
import type { ApiProductListItem } from "@/types/catalog";

function sessionParams() {
  return { sessionKey: tokenStorage.getSessionKey() };
}

export const cartService = {
  get: () => apiGet<CartDto>(endpoints.cart.root, sessionParams()),

  addItem: (variantId: string, quantity: number) =>
    apiMutate<CartDto>("post", endpoints.cart.items, { variantId, quantity }, { params: sessionParams() }),

  updateItem: (itemId: string, quantity: number) =>
    apiMutate<CartDto>(
      "patch",
      endpoints.cart.item(itemId),
      { quantity },
      { params: sessionParams() },
    ),

  removeItem: (itemId: string) =>
    apiMutate<CartDto>("delete", endpoints.cart.item(itemId), undefined, {
      params: sessionParams(),
    }),

  /** Backend has no clear endpoint — remove each line then refetch. */
  clear: async () => {
    const cart = await cartService.get();
    await Promise.all((cart.items ?? []).map((item) => cartService.removeItem(item.id)));
    return cartService.get();
  },
};

export const wishlistService = {
  get: () => apiGet<WishlistDto>(endpoints.wishlist.root),
  add: (variantId: string) =>
    apiMutate<WishlistDto>("post", endpoints.wishlist.items, { variantId }),
  remove: (itemId: string) =>
    apiMutate<WishlistDto>("delete", endpoints.wishlist.item(itemId)),
};

export const ordersService = {
  list: () =>
    apiGet<
      Array<{
        id: string;
        orderNumber?: string;
        createdAt?: string;
        total?: number;
        status?: string;
      }>
    >(endpoints.orders.list),
  one: (idOrNumber: string) => apiGet<unknown>(endpoints.orders.one(idOrNumber)),
  checkout: (body: unknown, idempotencyKey: string) =>
    apiMutate("post", endpoints.orders.checkout, body, { idempotencyKey }),
  addresses: () => addressesService.list(),
};

export const marketingService = {
  banners: () => apiGet<unknown[]>(endpoints.marketing.banners),
  navigation: () => apiGet<unknown>(endpoints.marketing.navigation),
  featureFlags: () => apiGet<unknown[]>(endpoints.marketing.featureFlags),
  recommendations: (params?: { productId?: string; type?: string }) =>
    apiGet<ApiProductListItem[]>(endpoints.marketing.recommendations, params),
  searchSuggestions: (q: string) =>
    apiGet<unknown[]>(endpoints.marketing.searchSuggestions, { q }),
  validateCoupon: (body: { code: string; cartTotal: number }) =>
    apiMutate<{
      valid: boolean;
      discount?: number;
      message?: string;
      code?: string;
      couponId?: string;
      reasons?: string[];
      errors?: unknown[];
    }>("post", endpoints.marketing.validateCoupon, body),
};

export const healthService = {
  check: () => apiGet<{ status: string }>(endpoints.health.root),
  ready: () =>
    apiGet<{
      status: string;
      info?: Record<string, { status: string }>;
    }>(endpoints.health.ready),
};

export const adminService = {
  orders: (params?: { page?: number; limit?: number; status?: string }) =>
    apiGetPaginatedSafe(endpoints.admin.orders, params),
  products: (params?: { page?: number; limit?: number }) =>
    apiGetPaginatedSafe(endpoints.admin.catalogProducts, params),
  dashboard: () => apiGet<unknown>(endpoints.analytics.dashboard),
  lowStock: () => apiGet<unknown[]>(endpoints.admin.lowStock),
  marketingDashboard: () => apiGet<unknown>(endpoints.admin.marketingDashboard),
};

async function apiGetPaginatedSafe(url: string, params?: Record<string, unknown>) {
  const { apiGetPaginated } = await import("@/api/client");
  return apiGetPaginated<unknown>(url, params);
}
