export type Product = {
  id: string;
  /** Primary sellable variant UUID — required for Nest cart/wishlist APIs */
  variantId?: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  condition: string;
  specs: string;
  image: string;
  badge?: string;
  refurbished?: boolean;
  category?: string;
  dealEndsIn?: string;
};

export type Brand = {
  name: string;
  image: string;
  color: string;
  knockout?: boolean;
};

export type Category = {
  title: string;
  description: string;
  icon: string;
  glow: string;
  badge: "blue" | "orange";
  image?: string;
};

export type WhyChooseItem = {
  icon: string;
  title: string;
  body: string;
  color: string;
};

export type Review = {
  name: string;
  city: string;
  rating: number;
  text: string;
};

export type Faq = { q: string; a: string };
