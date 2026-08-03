"use client";

import { useEffect, useMemo, useState } from "react";
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

type ExistingImage = { id: string; url: string; isPrimary?: boolean };

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
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  const previews = useMemo(
    () => imageFiles.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [imageFiles],
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

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
        setExistingImages(
          (p.media ?? [])
            .map((m) => ({
              id: m.id,
              url: m.url || "",
              isPrimary: m.isPrimary,
            }))
            .filter((m) => m.url),
        );
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
        images: imageFiles,
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

          <div className="space-y-3 rounded-[16px] border border-dashed border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-navy">Product images</p>
                <p className="text-xs text-muted">JPG/PNG/WebP up to 8MB. First image is primary.</p>
              </div>
              <label className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5">
                Add images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (!files.length) return;
                    setImageFiles((prev) => [...prev, ...files].slice(0, 8));
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {(existingImages.length > 0 || previews.length > 0) && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative overflow-hidden rounded-[14px] border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-28 w-full object-cover" />
                    {img.isPrimary && (
                      <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
                {previews.map((p, i) => (
                  <div key={`${p.name}-${i}`} className="relative overflow-hidden rounded-[14px] border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.name} className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-navy"
                      onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
