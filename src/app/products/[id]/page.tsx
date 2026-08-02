import type { Metadata } from "next";
import { allProducts } from "@/lib/mock-data";
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";
import { ProductDetailClient } from "./product-detail-client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = allProducts.find((p) => p.id === id) ?? allProducts[0];
  return pageMetadata({
    title: product.name,
    description: `${product.brand} · ${product.specs}. Certified quality with warranty.`,
    path: `/products/${product.id}`,
    image: product.image,
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = allProducts.find((p) => p.id === id) ?? allProducts[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
              { name: product.name, path: `/products/${product.id}` },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productJsonLd({
              name: product.name,
              description: product.specs,
              image: product.image,
              price: product.price,
              brand: product.brand,
            }),
          ),
        }}
      />
      <ProductDetailClient id={id} />
    </>
  );
}
