import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { LEGAL_SLUGS } from "@/lib/legal-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  const staticRoutes = [
    "",
    "/products",
    "/cart",
    "/checkout",
    "/support",
    "/orders/track",
    "/auth/login",
    "/auth/register",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path || "/"}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...LEGAL_SLUGS.map((slug) => ({
      url: `${base}/legal/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
