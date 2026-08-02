import type { Brand, Category } from "@/types";
import type { ApiBrand, ApiCategory } from "@/types/catalog";

const BRAND_COLORS: Record<string, { color: string; knockout?: boolean; image: string }> = {
  apple: { color: "#555555", image: "/images/apple.png" },
  dell: { color: "#007DB8", knockout: true, image: "/images/dell.png" },
  hp: { color: "#0096D6", knockout: true, image: "/images/hp.png" },
  asus: { color: "#000000", image: "/images/asus.png" },
  lenovo: { color: "#E2231A", knockout: true, image: "/images/lenovo.png" },
  acer: { color: "#83B81A", knockout: true, image: "/images/acer.png" },
  samsung: { color: "#1428A0", knockout: true, image: "/images/samsung.png" },
  msi: { color: "#E11B22", knockout: true, image: "/images/msi.png" },
};

const CATEGORY_META: Record<
  string,
  { icon: string; glow: string; badge: "blue" | "orange"; image?: string }
> = {
  laptops: { icon: "Laptop", glow: "#D6E4FF", badge: "blue", image: "/images/laptop.png" },
  desktops: { icon: "Monitor", glow: "#E8DEFF", badge: "blue" },
  gaming: { icon: "Gamepad2", glow: "#FFE0D6", badge: "orange" },
  mobiles: { icon: "Smartphone", glow: "#E5DEFF", badge: "orange" },
  smartphones: { icon: "Smartphone", glow: "#E5DEFF", badge: "orange" },
  tablets: { icon: "Tablet", glow: "#D6ECFF", badge: "blue" },
  accessories: { icon: "Headphones", glow: "#FFE8D6", badge: "orange" },
  printers: { icon: "Printer", glow: "#D9E8FF", badge: "blue" },
  components: { icon: "Cpu", glow: "#E8E0FF", badge: "blue" },
  storage: { icon: "HardDrive", glow: "#FFE4D4", badge: "orange" },
  "smart-devices": { icon: "Watch", glow: "#D6E6FF", badge: "blue" },
};

export function toUiBrand(b: ApiBrand): Brand {
  const meta = BRAND_COLORS[b.slug?.toLowerCase() ?? ""] ?? {
    color: "#1E5EFF",
    image: "/images/apple.png",
  };
  return {
    name: b.name,
    image: meta.image,
    color: meta.color,
    knockout: meta.knockout,
  };
}

export function toUiBrands(list: ApiBrand[]): Brand[] {
  return list.map(toUiBrand);
}

export function toUiCategory(c: ApiCategory): Category {
  const meta = CATEGORY_META[c.slug?.toLowerCase() ?? ""] ?? {
    icon: "Laptop",
    glow: "#D6E4FF",
    badge: "blue" as const,
  };
  return {
    title: c.name,
    description: c.description || `Shop ${c.name}`,
    icon: meta.icon,
    glow: meta.glow,
    badge: meta.badge,
    image: meta.image,
  };
}

export function toUiCategories(list: ApiCategory[]): Category[] {
  return list.map(toUiCategory);
}
