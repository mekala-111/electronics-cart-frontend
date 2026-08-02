"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Laptop,
  Monitor,
  Gamepad2,
  Smartphone,
  Tablet,
  Headphones,
  Printer,
  Cpu,
  HardDrive,
  Watch,
} from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

const icons = {
  Laptop,
  Monitor,
  Gamepad2,
  Smartphone,
  Tablet,
  Headphones,
  Printer,
  Cpu,
  HardDrive,
  Watch,
} as const;

/** Flutter CategoryCard */
export function CategoryCard({ category }: { category: Category }) {
  const Icon = icons[category.icon as keyof typeof icons] ?? Laptop;
  const badge = category.badge === "orange" ? "#F15A24" : "#1E5EFF";

  return (
    <Link
      href={`/products?category=${encodeURIComponent(category.title)}`}
      className={cn(
        "group flex h-full flex-col items-center rounded-[24px] border border-border bg-white px-[18px] pb-[18px] pt-5 text-center shadow-[0_8px_18px_rgba(8,21,47,0.06)] transition duration-[220ms] ease-out",
        "hover:-translate-y-2 hover:border-primary/45 hover:shadow-[0_14px_28px_rgba(30,94,255,0.14)]",
      )}
    >
      <div className="relative flex min-h-[100px] w-full flex-1 items-center justify-center">
        <div
          className="absolute h-[108px] w-[108px] rounded-full transition group-hover:h-[118px] group-hover:w-[118px]"
          style={{
            background: `radial-gradient(circle, ${category.glow} 0%, ${category.glow}26 55%, transparent 100%)`,
          }}
        />
        {category.image ? (
          <Image
            src={category.image}
            alt={category.title}
            width={140}
            height={88}
            style={{ width: "auto", height: "auto" }}
            className="relative z-10 h-[88px] object-contain transition duration-[220ms] group-hover:scale-105"
          />
        ) : (
          <Icon className="relative z-10 h-16 w-16 text-navy/85 transition group-hover:scale-105" />
        )}
      </div>
      <div
        className="mt-2 flex h-9 w-9 items-center justify-center rounded-full border"
        style={{
          backgroundColor: `${badge}1A`,
          borderColor: `${badge}33`,
          color: badge,
        }}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <p className="mt-3 text-base font-bold text-navy">{category.title}</p>
      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.35] text-muted">
        {category.description}
      </p>
      <p className="mt-3.5 text-[13.5px] font-semibold text-primary group-hover:underline">
        Explore →
      </p>
    </Link>
  );
}
