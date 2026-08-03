import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Boxes,
  Tags,
  FolderTree,
  Layers,
  Package,
  Image,
  BadgeCheck,
  Search,
  BookOpen,
  Warehouse,
  MapPin,
  Copy,
  ArrowLeftRight,
  ClipboardList,
  PackagePlus,
  SlidersHorizontal,
  AlertTriangle,
  ShoppingCart,
  Truck,
  ShieldAlert,
  CreditCard,
  Banknote,
  Scale,
  Gavel,
  Ship,
  Tag,
  RotateCcw,
  Webhook,
  Shield,
  Wrench,
  Ticket,
  Megaphone,
  Gift,
  Flag,
  Users,
  BarChart3,
  Settings,
  Receipt,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  items?: AdminNavItem[];
};

export const adminNav: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "catalog",
    label: "Catalog",
    icon: Boxes,
    items: [
      { href: "/admin/catalog/brands", label: "Brands", icon: Tags },
      { href: "/admin/catalog/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/catalog/collections", label: "Collections", icon: Layers },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/catalog/variants", label: "Variants", icon: Copy },
      { href: "/admin/catalog/media", label: "Media Gallery", icon: Image },
      { href: "/admin/catalog/badges", label: "Badges", icon: BadgeCheck },
      { href: "/admin/catalog/seo", label: "SEO", icon: Search },
      { href: "/admin/catalog/buying-guides", label: "Buying Guides", icon: BookOpen },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Warehouse,
    items: [
      { href: "/admin/inventory", label: "Stock Overview", icon: Warehouse },
      { href: "/admin/inventory/warehouses", label: "Warehouses", icon: MapPin },
      { href: "/admin/inventory/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
      { href: "/admin/inventory/low-stock", label: "Low Stock Alerts", icon: AlertTriangle },
      { href: "/admin/inventory/transfers", label: "Transfers", icon: ArrowLeftRight },
      { href: "/admin/inventory/adjustments", label: "Adjustments", icon: SlidersHorizontal },
      { href: "/admin/inventory/goods-receipts", label: "Goods Receipt", icon: PackagePlus },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/invoices", label: "Invoices", icon: Receipt },
      { href: "/admin/orders/fulfillments", label: "Fulfillments", icon: Truck },
      { href: "/admin/orders/risk", label: "Risk Analysis", icon: ShieldAlert },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    items: [
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/payments/settlements", label: "Settlements", icon: Banknote },
      { href: "/admin/payments/reconciliation", label: "Reconciliation", icon: Scale },
      { href: "/admin/payments/disputes", label: "Disputes", icon: Gavel },
      { href: "/admin/payments/failed", label: "Failed Payments", icon: AlertTriangle },
    ],
  },
  {
    id: "shipping",
    label: "Shipping",
    icon: Ship,
    items: [
      { href: "/admin/shipping", label: "Shipments", icon: Ship },
      { href: "/admin/shipping/carriers", label: "Carriers", icon: Truck },
      { href: "/admin/shipping/rates", label: "Rates", icon: Tag },
      { href: "/admin/shipping/rto", label: "RTO", icon: RotateCcw },
      { href: "/admin/shipping/webhooks", label: "Webhook Logs", icon: Webhook },
    ],
  },
  {
    id: "warranty",
    label: "Warranty",
    icon: Shield,
    items: [
      { href: "/admin/warranty", label: "Plans & Claims", icon: Shield },
      { href: "/admin/warranty/rma", label: "RMA", icon: RotateCcw },
    ],
  },
  {
    id: "service",
    label: "Service Center",
    icon: Wrench,
    items: [
      { href: "/admin/service", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/service/jobs", label: "Jobs", icon: Wrench },
      { href: "/admin/service/tickets", label: "Tickets", icon: Ticket },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    items: [
      { href: "/admin/marketing", label: "Dashboard", icon: Megaphone },
      { href: "/admin/marketing/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/admin/marketing/coupons", label: "Coupons", icon: Gift },
      { href: "/admin/marketing/feature-flags", label: "Feature Flags", icon: Flag },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    href: "/admin/customers",
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    href: "/admin/reports",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export const adminQuickActions: AdminNavItem[] = [
  { href: "/admin/products/new", label: "Add Product", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inventory/adjustments", label: "Adjust Stock", icon: SlidersHorizontal },
  { href: "/admin/inventory/goods-receipts", label: "Goods Receipt", icon: PackagePlus },
  { href: "/admin/inventory/purchase-orders", label: "Create PO", icon: ClipboardList },
  { href: "/admin/marketing/campaigns", label: "Campaign", icon: Megaphone },
  { href: "/admin/marketing/coupons", label: "Coupon", icon: Gift },
  { href: "/admin/warranty", label: "Warranty", icon: Shield },
  { href: "/admin/service/jobs", label: "Assign Job", icon: Wrench },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function breadcrumbForPath(pathname: string): Array<{ label: string; href?: string }> {
  if (pathname === "/admin") return [{ label: "Dashboard" }, { label: "Overview" }];
  const parts = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const crumbs: Array<{ label: string; href?: string }> = [{ label: "Dashboard", href: "/admin" }];
  let acc = "/admin";
  for (const part of parts) {
    acc += `/${part}`;
    crumbs.push({
      label: part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      href: acc,
    });
  }
  return crumbs;
}
