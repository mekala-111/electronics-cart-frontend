export type ApiBrand = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  country?: string | null;
  website?: string | null;
  sortOrder?: number;
  logoFileId?: string | null;
  status?: string;
};

export type ApiCategory = {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
  iconFileId?: string | null;
  bannerFileId?: string | null;
  status?: string;
};

export type ApiCategoryTreeNode = ApiCategory & {
  children: ApiCategoryTreeNode[];
};

export type ApiProductListItem = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  isFeatured?: boolean;
  isRefurbished?: boolean;
  isNewArrival?: boolean;
  ratingAvg?: number;
  reviewCount?: number;
  priceFrom?: number | null;
  currency?: string | null;
  stockStatus?: string | null;
  condition?: string | null;
  primaryImageUrl?: string | null;
  badge?: string | null;
};

export type ApiVariant = {
  id: string;
  productId: string;
  sku: string;
  ram?: string | null;
  storage?: string | null;
  processor?: string | null;
  gpu?: string | null;
  condition?: string | null;
  grade?: string | null;
  mrp?: number | null;
  salePrice?: number | null;
  discountPercent?: number | null;
  currency?: string | null;
  stockStatus?: string | null;
  batteryHealth?: number | null;
  status?: string;
};

export type ApiProductDetail = ApiProductListItem & {
  description?: string | null;
  variants?: ApiVariant[];
  specifications?: Array<{
    id: string;
    name: string;
    value: string;
    group?: { id: string; code: string; name: string };
    sortOrder?: number;
  }>;
  media?: Array<{
    id: string;
    altText?: string | null;
    isPrimary?: boolean;
    sortOrder?: number;
    url?: string | null;
    file?: { id: string; bucket: string; objectKey: string; mimeType?: string };
  }>;
};

export type ProductSearchParams = {
  page?: number;
  limit?: number;
  q?: string;
  brandId?: string;
  brandSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  collectionId?: string;
  collectionSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  availability?: string;
  attributes?: string;
  minRating?: number;
  featured?: boolean;
  refurbished?: boolean;
  newArrival?: boolean;
  sort?: "price_asc" | "price_desc" | "newest" | "rating" | "name";
};
