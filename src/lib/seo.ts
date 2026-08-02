import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";

const DEFAULT_DESC =
  "Certified new & refurbished laptops with warranty, fast delivery, and transparent condition grading.";

export function pageMetadata({
  title,
  description = DEFAULT_DESC,
  path = "/",
  image = "/images/laptop.png",
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const site = getSiteUrl();
  const url = `${site}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Electronics Cart`,
      description,
      url,
      siteName: "Electronics Cart",
      images: [{ url: image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Electronics Cart`,
      description,
      images: [image],
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site}${item.path}`,
    })),
  };
}

export function productJsonLd(p: {
  name: string;
  description: string;
  image: string;
  price: number;
  brand: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.image,
    brand: { "@type": "Brand", name: p.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: p.price,
      availability: "https://schema.org/InStock",
    },
  };
}
