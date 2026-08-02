"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useAdminProducts } from "@/hooks/use-commerce";
import { formatInr } from "@/lib/utils";

import { useDebouncedValue } from "@/hooks/use-debounce";

export default function AdminProductsPage() {
  const { data, isLoading } = useAdminProducts();
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 300);
  const products = useMemo(() => {
    const list = data?.data ?? [];
    if (!debouncedQ) return list;
    const needle = debouncedQ.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.brand.toLowerCase().includes(needle) ||
        p.id.toLowerCase().includes(needle),
    );
  }, [data?.data, debouncedQ]);

  return (
      <AdminShell>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-navy">
              Product <span className="text-accent">Management</span>
            </h1>
            <p className="mt-2 text-muted">Table, filters, variants, SEO — API-ready.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const rows = [["Name", "Brand", "Price", "Condition"], ...products.map((p) => [p.name, p.brand, String(p.price), p.condition])];
                const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "products.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </Button>
            <Button variant="outline">Bulk Upload</Button>
            <Link href="/admin/products/new">
              <Button>Add Product</Button>
            </Link>
          </div>
        </div>

        <LiveDataBanner show={data?.degraded} className="mt-4" />

        <div className="mt-6 flex flex-wrap gap-3">
          <Input
            placeholder="Search SKU / name"
            className="max-w-xs"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="rounded-[16px] border border-border bg-white px-4 py-3 text-sm">
            <option>All brands</option>
            <option>Apple</option>
            <option>Dell</option>
          </select>
          <select className="rounded-[16px] border border-border bg-white px-4 py-3 text-sm">
            <option>All conditions</option>
            <option>New</option>
            <option>Refurbished</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[24px] border border-border bg-white shadow-[var(--shadow-soft)]">
          {isLoading && !data ? (
            <div className="h-48 animate-pulse bg-section" />
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-border bg-section text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Brand</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Condition</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border/70">
                    <td className="px-4 py-3 font-semibold text-navy">{p.name}</td>
                    <td className="px-4 py-3 text-muted">{p.brand}</td>
                    <td className="px-4 py-3 font-bold text-primary">{formatInr(p.price)}</td>
                    <td className="px-4 py-3">{p.condition}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}`} className="font-semibold text-primary hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AdminShell>
  );
}
