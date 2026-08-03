"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { useAdminCatalogMeta, useAdminProducts } from "@/hooks/use-commerce";
import { formatInr } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounce";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [brandId, setBrandId] = useState("");
  const [condition, setCondition] = useState("all");
  const debouncedQ = useDebouncedValue(q, 300);
  const meta = useAdminCatalogMeta();
  const { data, isLoading } = useAdminProducts({
    q: debouncedQ || undefined,
    brandId: brandId || undefined,
  });

  const products = useMemo(() => {
    const list = data?.data ?? [];
    if (condition === "all") return list;
    return list.filter((p) =>
      condition === "refurbished"
        ? p.refurbished || p.condition?.toLowerCase().includes("refurb")
        : !p.refurbished && !p.condition?.toLowerCase().includes("refurb"),
    );
  }, [data?.data, condition]);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">
            Product <span className="text-accent">Management</span>
          </h1>
          <p className="mt-2 text-muted">Live catalog — create, edit, and filter products.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const rows = [
                ["Name", "Brand", "Price", "Condition"],
                ...products.map((p) => [p.name, p.brand, String(p.price), p.condition]),
              ];
              const csv = rows
                .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
                .join("\n");
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
          <Link href="/admin/products/new">
            <Button>Add Product</Button>
          </Link>
        </div>
      </div>

      <LiveDataBanner show={data?.degraded} className="mt-4" />

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          placeholder="Search name / SKU"
          className="max-w-xs"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded-[16px] border border-border bg-white px-4 py-3 text-sm"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
        >
          <option value="">All brands</option>
          {(meta.data?.brands ?? []).map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-[16px] border border-border bg-white px-4 py-3 text-sm"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="all">All conditions</option>
          <option value="new">New</option>
          <option value="refurbished">Refurbished</option>
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
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
