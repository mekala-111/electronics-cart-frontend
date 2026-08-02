/** Nest GET /wishlist response (orders.service getWishlist) */

export type WishlistLineDto = {
  id: string;
  variantId: string;
  sku: string;
};

export type WishlistDto = {
  id: string;
  name: string;
  items: WishlistLineDto[];
};

/** Display enrichment keyed by variantId (not commerce source of truth). */
export type WishlistLineDisplay = {
  productId: string;
  name: string;
  brand?: string;
  image: string;
  specs?: string;
  price?: number;
  mrp?: number;
  rating?: number;
  reviews?: number;
  condition?: string;
};

export type WishlistProductMetaMap = Record<string, WishlistLineDisplay>;
