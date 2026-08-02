import type { Product } from "@/types";
import type { ApiProductDetail, ApiProductListItem } from "@/types/catalog";

const FALLBACK_IMAGE = "/images/laptop.png";

function specsFromItem(p: ApiProductListItem | ApiProductDetail): string {
  const detail = p as ApiProductDetail;
  const v = detail.variants?.[0];
  if (v) {
    return [v.ram, v.storage, v.processor].filter(Boolean).join(" · ") || "—";
  }
  return p.shortDescription?.slice(0, 48) || "—";
}

/** Map API product → existing storefront Product card shape (keeps UI identical). */
export function toUiProduct(p: ApiProductListItem | ApiProductDetail): Product {
  const detail = p as ApiProductDetail;
  const variant = detail.variants?.[0];
  const price = variant?.salePrice ?? p.priceFrom ?? 0;
  const mrp = variant?.mrp ?? price;
  const image =
    detail.media?.find((m) => m.isPrimary)?.url ||
    detail.media?.[0]?.url ||
    p.primaryImageUrl ||
    FALLBACK_IMAGE;

  return {
    id: p.id,
    variantId: variant?.id,
    name: p.name,
    brand: p.brand?.name ?? "—",
    price,
    mrp,
    rating: p.ratingAvg ?? 0,
    reviews: p.reviewCount ?? 0,
    condition: variant?.condition ?? p.condition ?? (p.isRefurbished ? "Refurbished" : "New"),
    specs: specsFromItem(p),
    image,
    badge: p.badge ?? undefined,
    refurbished: p.isRefurbished,
    category: p.category?.name,
  };
}

export function toUiProducts(items: Array<ApiProductListItem | ApiProductDetail>): Product[] {
  return items.map(toUiProduct);
}
