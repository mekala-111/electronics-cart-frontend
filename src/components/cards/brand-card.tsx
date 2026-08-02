"use client";

import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/types";
import { cn } from "@/lib/utils";

/** Flutter BrandCard — 148×152, radius 24; knockoutBlack → mix-blend screen */
export function BrandCard({
  brand,
  width = 148,
  height = 152,
}: {
  brand: Brand;
  width?: number;
  height?: number;
}) {
  return (
    <Link
      href={`/products?brand=${encodeURIComponent(brand.name)}`}
      style={{ width, height }}
      className={cn(
        "group flex shrink-0 flex-col items-center rounded-[24px] border border-border bg-white px-4 pb-3.5 pt-[18px]",
        "shadow-[0_8px_16px_rgba(8,21,47,0.05)] transition duration-[220ms] ease-out",
        "hover:-translate-y-1.5 hover:border-primary hover:shadow-[0_12px_24px_rgba(30,94,255,0.14),0_0_28px_rgba(30,94,255,0.08)]",
      )}
    >
      <div className="isolate flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-white">
        <Image
          src={brand.image}
          alt={`${brand.name} logo`}
          width={120}
          height={56}
          style={{ width: "auto", height: "auto" }}
          className={cn(
            "h-14 max-w-full object-contain opacity-[0.92] transition duration-[220ms] ease-out group-hover:scale-105 group-hover:opacity-100",
            /* Flutter knockoutBlack — black plate → transparent on white card */
            brand.knockout && "mix-blend-screen",
          )}
        />
      </div>
      <p className="mt-2.5 truncate text-sm font-semibold text-navy">{brand.name}</p>
    </Link>
  );
}
