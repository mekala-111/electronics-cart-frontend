import type { Brand, Category, Faq, Product, Review, WhyChooseItem } from "@/types";

const laptop = "/images/laptop.png";

export const brands: Brand[] = [
  { name: "Apple", image: "/images/apple.png", color: "#555555" },
  { name: "Dell", image: "/images/dell.png", color: "#007DB8", knockout: true },
  { name: "HP", image: "/images/hp.png", color: "#0096D6", knockout: true },
  { name: "ASUS", image: "/images/asus.png", color: "#000000" },
  { name: "Lenovo", image: "/images/lenovo.png", color: "#E2231A", knockout: true },
  { name: "Acer", image: "/images/acer.png", color: "#83B81A", knockout: true },
  { name: "Samsung", image: "/images/samsung.png", color: "#1428A0", knockout: true },
  { name: "MSI", image: "/images/msi.png", color: "#E11B22", knockout: true },
];

export const categories: Category[] = [
  { title: "Laptops", description: "Best performance laptops", icon: "Laptop", glow: "#D6E4FF", badge: "blue", image: laptop },
  { title: "Desktops", description: "Powerful desktops for work", icon: "Monitor", glow: "#E8DEFF", badge: "blue" },
  { title: "Gaming", description: "High-performance gaming gear", icon: "Gamepad2", glow: "#FFE0D6", badge: "orange" },
  { title: "Mobiles", description: "Latest smartphones", icon: "Smartphone", glow: "#E5DEFF", badge: "orange" },
  { title: "Tablets", description: "Powerful tablets", icon: "Tablet", glow: "#D6ECFF", badge: "blue" },
  { title: "Accessories", description: "Essential tech accessories", icon: "Headphones", glow: "#FFE8D6", badge: "orange" },
  { title: "Printers", description: "Reliable printing solutions", icon: "Printer", glow: "#D9E8FF", badge: "blue" },
  { title: "Components", description: "Build your dream setup", icon: "Cpu", glow: "#E8E0FF", badge: "blue" },
  { title: "Storage", description: "Fast & Reliable SSD & HDD", icon: "HardDrive", glow: "#FFE4D4", badge: "orange" },
  { title: "Smart Devices", description: "Stay connected everywhere", icon: "Watch", glow: "#D6E6FF", badge: "blue" },
];

export const featuredProducts: Product[] = [
  { id: "p1", name: 'MacBook Air M2 13"', brand: "Apple", price: 78990, mrp: 99900, rating: 4.8, reviews: 214, condition: "Like New", specs: "8GB · 256GB · M2", image: laptop, badge: "Best Seller", refurbished: true, category: "Laptops" },
  { id: "p2", name: "Dell XPS 13 Plus", brand: "Dell", price: 84990, mrp: 109990, rating: 4.6, reviews: 128, condition: "Excellent", specs: "16GB · 512GB · i7", image: laptop, badge: "Hot", refurbished: true, category: "Laptops" },
  { id: "p3", name: "HP Pavilion Aero 13", brand: "HP", price: 56990, mrp: 72990, rating: 4.5, reviews: 96, condition: "Good", specs: "16GB · 512GB · Ryzen 5", image: laptop, category: "Laptops" },
  { id: "p4", name: "ASUS Zenbook 14 OLED", brand: "ASUS", price: 74990, mrp: 94990, rating: 4.7, reviews: 173, condition: "Like New", specs: "16GB · 1TB · Ultra 7", image: laptop, badge: "OLED", refurbished: true, category: "Laptops" },
];

export const flashDeals: Product[] = [
  { id: "d1", name: "Lenovo ThinkPad T14", brand: "Lenovo", price: 49990, mrp: 79990, rating: 4.4, reviews: 88, condition: "Good", specs: "16GB · 512GB · i5", image: laptop, badge: "Flash", refurbished: true, category: "Laptops", dealEndsIn: "05:42:00" },
  { id: "d2", name: "Acer Swift Go 14", brand: "Acer", price: 52990, mrp: 69990, rating: 4.3, reviews: 61, condition: "Excellent", specs: "16GB · 512GB · Ultra 5", image: laptop, badge: "Flash", refurbished: true, category: "Laptops", dealEndsIn: "03:18:00" },
  { id: "d3", name: "Samsung Galaxy Book4", brand: "Samsung", price: 61990, mrp: 84990, rating: 4.5, reviews: 74, condition: "Like New", specs: "16GB · 512GB · Ultra 7", image: laptop, badge: "Flash", refurbished: true, category: "Laptops", dealEndsIn: "08:05:00" },
  { id: "d4", name: "MSI Modern 15", brand: "MSI", price: 44990, mrp: 64990, rating: 4.2, reviews: 52, condition: "Good", specs: "16GB · 512GB · Ryzen 7", image: laptop, badge: "Flash", refurbished: true, category: "Laptops", dealEndsIn: "01:55:00" },
];

export const refurbishedProducts: Product[] = [
  { id: "r1", name: 'MacBook Pro 14" M1 Pro', brand: "Apple", price: 99990, mrp: 169900, rating: 4.9, reviews: 312, condition: "Certified", specs: "16GB · 512GB · M1 Pro", image: laptop, badge: "Certified", refurbished: true, category: "Laptops" },
  { id: "r2", name: "Dell Latitude 5440", brand: "Dell", price: 38990, mrp: 58990, rating: 4.4, reviews: 140, condition: "Excellent", specs: "16GB · 512GB · i5", image: laptop, badge: "1 Yr Warranty", refurbished: true, category: "Laptops" },
  { id: "r3", name: "HP EliteBook 840 G8", brand: "HP", price: 42990, mrp: 64990, rating: 4.5, reviews: 119, condition: "Like New", specs: "16GB · 512GB · i7", image: laptop, badge: "Business", refurbished: true, category: "Laptops" },
  { id: "r4", name: "ASUS ROG Zephyrus G14", brand: "ASUS", price: 87990, mrp: 124990, rating: 4.7, reviews: 201, condition: "Excellent", specs: "16GB · 1TB · Ryzen 9", image: laptop, badge: "Gaming", refurbished: true, category: "Laptops" },
];

export const whyChooseItems: WhyChooseItem[] = [
  { icon: "ShieldCheck", title: "Certified Quality", body: "Every device passes a 50-point diagnostics checklist.", color: "#1E5EFF" },
  { icon: "Shield", title: "1 Year Warranty", body: "Full coverage with easy claim support across India.", color: "#F15A24" },
  { icon: "Truck", title: "Fast Delivery", body: "Express shipping to major cities within 24–48 hours.", color: "#1E5EFF" },
  { icon: "IndianRupee", title: "Best Prices", body: "Transparent pricing with up to 50% off on refurbished.", color: "#F15A24" },
];

export const reviews: Review[] = [
  { name: "Ananya Reddy", city: "Hyderabad", rating: 5, text: "Bought a refurbished MacBook Air — looks brand new and battery health is excellent. Delivery was next day." },
  { name: "Karthik Rao", city: "Bengaluru", rating: 5, text: "Transparent condition grading and a solid warranty. Saved nearly ₹40k versus buying new." },
  { name: "Meera Shah", city: "Mumbai", rating: 4.5, text: "Support team helped pick the right ThinkPad for work. Smooth checkout and easy returns policy." },
];

export const faqs: Faq[] = [
  { q: "What does “Certified Refurbished” mean?", a: "Devices are inspected, repaired if needed, cleaned, and tested across performance, battery, display, and ports before listing." },
  { q: "Is there a warranty on refurbished laptops?", a: "Yes. Most refurbished laptops include a 1-year Electronics Cart warranty covering hardware defects." },
  { q: "Can I return a product?", a: "You can return eligible products within 7 days if they don’t match the listed condition. Easy pickup is available in major cities." },
  { q: "Do you ship across India?", a: "Yes. We deliver nationwide with insured packaging. Express options are available in select metro cities." },
];

export const allProducts: Product[] = [
  ...featuredProducts,
  ...flashDeals,
  ...refurbishedProducts,
];

/** @deprecated use whyChooseItems */
export const whyChoose = whyChooseItems;
