/** Nest cart envelope shapes (orders.mapper mapCart) */

export type CartLineDto = {
  id: string;
  variantId: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CartDto = {
  id: string;
  userId?: string | null;
  sessionKey?: string | null;
  currency: string;
  status: string;
  subtotal: number;
  items: CartLineDto[];
};

/** Client-side display enrichment keyed by variantId (not commerce source of truth). */
export type CartLineDisplay = {
  productId: string;
  name: string;
  brand?: string;
  image: string;
  specs?: string;
};

export type CartProductMetaMap = Record<string, CartLineDisplay>;

/** UI-facing cart line after merging API + display meta */
export type CartLineView = CartLineDto & {
  productId: string;
  name: string;
  brand: string;
  image: string;
  specs: string;
};
