"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/features/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalogService } from "@/services/catalog.service";
import { useAdminCatalogMeta, useSaveAdminProduct } from "@/hooks/use-commerce";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 280);
}

export default function AdminProductFormPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id && params.id !== "new" ? params.id : undefined;
  const router = useRouter();
  const meta = useAdminCatalogMeta();
  const save = useSaveAdminProduct();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productTypeId, setProductTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [specs, setSpecs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    catalogService
      .product(id)
      .then((p) => {
        if (cancelled) return;
        setName(p.name);
        setSlug(p.slug);
        setBrandId(p.brand?.id ?? "");
        setCategoryId(p.category?.id ?? "");
        setProductTypeId((p as { productTypeId?: string }).productTypeId ?? "");
        setDescription(p.description ?? p.shortDescription ?? "");
        setSeoTitle(p.name);
        const v = p.variants?.[0];
        if (v) {
          setSku(v.sku);
          setPrice(String(v.salePrice ?? ""));
          setMrp(String(v.mrp ?? ""));
          setSpecs([v.ram, v.storage, v.processor].filter(Boolean).join(" · "));
        }
      })
      .catch((e: Error) => setError(e.message || "Failed to load product"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!productTypeId && meta.data?.productTypes?.[0]) {
      setProductTypeId(meta.data.productTypes[0].id);
    }
    if (!brandId && meta.data?.brands?.[0]) setBrandId(meta.data.brands[0].id);
    if (!categoryId && meta.data?.categories?.[0]) setCategoryId(meta.data.categories[0].id);
  }, [meta.data, productTypeId, brandId, categoryId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const finalSlug = slug || slugify(name);
    if (!name || !brandId || !categoryId || !productTypeId) {
      setError("Name, brand, category, and product type are required.");
      return;
    }
    try {
      const typeCode = meta.data?.productTypes?.find((t) => t.id === productTypeId)?.code;
      const productId = await save.mutateAsync({
        id,
        product: {
          name,
          slug: finalSlug,
          brandId,
          categoryId,
          productTypeId,
          description: description || undefined,
          shortDescription: description?.slice(0, 500) || undefined,
          seoTitle: seoTitle || name,
          isRefurbished: typeCode === "refurbished" || undefined,
          isOpenBox: typeCode === "open_box" || undefined,
        },
        variant: id
          ? undefined
          : sku && price
            ? {
                sku,
                mrp: Number(mrp || price),
                salePrice: Number(price),
                ram: specs.split("·")[0]?.trim() || undefined,
                storage: specs.split("·")[1]?.trim() || undefined,
                processor: specs.split("·")[2]?.trim() || undefined,
                condition: "new",
                stockStatus: "in_stock",
              }
            : undefined,
      });
      router.push(`/admin/products/${productId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        {id ? "Edit" : "Add"} <span className="text-accent">Product</span>
      </h1>
      {loading ? (
        <div className="mt-8 h-64 animate-pulse rounded-[24px] bg-section" />
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-8 grid max-w-3xl gap-4 rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]"
        >
          <Input
            placeholder="Product name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!id) setSlug(slugify(e.target.value));
            }}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              className="rounded-[16px] border border-border bg-white px-4 py-3 text-sm"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
            >
              <option value="">Brand</option>
              {(meta.data?.brands ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-[16px] border border-border bg-white px-4 py-3 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Category</option>
              {(meta.data?.categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-[16px] border border-border bg-white px-4 py-3 text-sm"
              value={productTypeId}
              onChange={(e) => setProductTypeId(e.target.value)}
              required
            >
              <option value="">Product type</option>
              {(meta.data?.productTypes ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="SEO slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          {!id && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
              <Input
                placeholder="Sale price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <Input
                placeholder="MRP"
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
              />
              <Input
                placeholder="Specs (RAM · Storage · CPU)"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
              />
            </div>
          )}
          <textarea
            className="min-h-28 rounded-[16px] border border-border px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="SEO title"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
