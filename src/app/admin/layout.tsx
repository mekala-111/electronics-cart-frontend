import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { RequireAuth } from "@/components/shared/require-auth";

export const metadata: Metadata = pageMetadata({
  title: "Admin",
  description: "Electronics Cart admin console — sales, inventory, orders, and analytics.",
  path: "/admin",
});

/** All `/admin/**` routes require an authenticated admin session. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth admin>{children}</RequireAuth>;
}
