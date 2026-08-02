"use client";

import { useMemo, useState } from "react";
import { Grid3X3, List, SlidersHorizontal, WifiOff } from "lucide-react";
import { StoreChrome } from "@/components/layout/store-chrome";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle } from "@/components/shared/section-title";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProductCard } from "@/components/cards/product-card";
import { CtaButton } from "@/components/shared/cta-button";
import { Input } from "@/components/ui/input";
import { LiveDataBanner } from "@/components/shared/live-data-banner";
import { cn, formatInr } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useBrands, useProducts } from "@/hooks/use-catalog";
import { brands as mockBrands } from "@/lib/mock-data";
import type { ProductSearchParams } from "@/types/catalog";
import { useDebouncedValue, useNetworkStatus } from "@/hooks/use-debounce";

const ramOptions = ["8GB", "16GB", "32GB"];
const storageOptions = ["256GB", "512GB", "1TB"];
const processors = ["Intel i5", "Intel i7", "AMD Ryzen 5", "Apple M-series"];
const conditions = ["New", "Like New", "Excellent", "Good", "Certified"];
const warranties = ["6 months", "1 Year", "2 Years"];
const battery = ["90%+", "80–89%", "70–79%"];

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted hover:border-primary",
      )}
    >
      {children}
    </button>
  );
}

export default function ProductsClient() {
  const params = useSearchParams();
  const online = useNetworkStatus();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const debouncedQuery = useDebouncedValue(query, 350);
  const [brand, setBrand] = useState(params.get("brand") ?? "");
  const [condition, setCondition] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [processor, setProcessor] = useState("");
  const [warranty, setWarranty] = useState("");
  const [batteryHealth, setBatteryHealth] = useState("");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brandsQuery = useBrands();
  const brandOptions = brandsQuery.data?.data ?? mockBrands;

  const apiParams = useMemo((): ProductSearchParams => {
    const sortMap: Record<string, ProductSearchParams["sort"]> = {
      "price-asc": "price_asc",
      "price-desc": "price_desc",
      rating: "rating",
      featured: "newest",
    };
    return {
      page,
      limit: 8,
      q: debouncedQuery || undefined,
      brandSlug: brand ? brand.toLowerCase() : undefined,
      categorySlug: params.get("category")?.toLowerCase() || undefined,
      maxPrice,
      condition: condition || undefined,
      refurbished:
        params.get("condition") === "refurbished" || condition === "Certified"
          ? true
          : undefined,
      featured: params.get("deal") === "flash" ? true : undefined,
      newArrival: params.get("tag") === "new" ? true : undefined,
      sort: sortMap[sort] ?? "newest",
    };
  }, [brand, condition, debouncedQuery, maxPrice, page, params, sort]);

  const productsQuery = useProducts(apiParams);
  const items = productsQuery.data?.data.items ?? [];
  const meta = productsQuery.data?.data.meta;
  const degraded = productsQuery.data?.degraded || brandsQuery.data?.degraded;

  // Client-side attribute chips (ram/storage/processor) until API attributes are reliable
  const pageItems = useMemo(() => {
    let list = [...items];
    if (ram) list = list.filter((p) => p.specs.includes(ram));
    if (storage) list = list.filter((p) => p.specs.includes(storage));
    if (processor) {
      const map: Record<string, string[]> = {
        "Intel i5": ["i5"],
        "Intel i7": ["i7"],
        "AMD Ryzen 5": ["Ryzen 5"],
        "Apple M-series": ["M1", "M2", "M3"],
      };
      const keys = map[processor] ?? [];
      list = list.filter((p) => keys.some((k) => p.specs.includes(k)));
    }
    return list;
  }, [items, processor, ram, storage]);
  // ponytail: warranty/batteryHealth UI-ready; wire when product API exposes attributes

  const total = meta?.total ?? pageItems.length;
  const pages = Math.max(1, meta?.totalPages ?? (Math.ceil(total / 8) || 1));

  const Filters = (
    <aside className="space-y-6 rounded-[24px] border border-border bg-white p-5 shadow-[0_8px_16px_rgba(8,21,47,0.06)]">
      <div>
        <p className="mb-3 text-sm font-bold text-navy">Brand</p>
        <div className="flex flex-wrap gap-2">
          {brandOptions.map((b) => (
            <Chip
              key={b.name}
              active={brand === b.name}
              onClick={() => {
                setBrand(brand === b.name ? "" : b.name);
                setPage(1);
              }}
            >
              {b.name}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-bold text-navy">Max Price · {formatInr(maxPrice)}</p>
        <input
          type="range"
          min={20000}
          max={200000}
          step={5000}
          value={maxPrice}
          aria-label="Maximum price"
          onChange={(e) => {
            setMaxPrice(Number(e.target.value));
            setPage(1);
          }}
          className="w-full accent-primary"
        />
      </div>
      {(
        [
          ["Condition", conditions, condition, setCondition],
          ["RAM", ramOptions, ram, setRam],
          ["Storage", storageOptions, storage, setStorage],
          ["Processor", processors, processor, setProcessor],
          ["Warranty", warranties, warranty, setWarranty],
          ["Battery Health", battery, batteryHealth, setBatteryHealth],
        ] as const
      ).map(([label, opts, value, setter]) => (
        <div key={label}>
          <p className="mb-3 text-sm font-bold text-navy">{label}</p>
          <div className="flex flex-wrap gap-2">
            {opts.map((o) => (
              <Chip
                key={o}
                active={value === o}
                onClick={() => {
                  setter(value === o ? "" : o);
                  setPage(1);
                }}
              >
                {o}
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );

  return (
    <StoreChrome>
      <PageShell className="section-pad">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products" },
          ]}
        />
        <SectionTitle
          eyebrow="CATALOG"
          title="Shop Products"
          accentWord="Products"
          subtitle={`${total} results · Certified new & refurbished electronics`}
        />
        <LiveDataBanner show={degraded} className="mt-4" />
        {!online ? (
          <div
            className="mt-3 flex items-center gap-2 rounded-[14px] border border-border bg-section px-4 py-2.5 text-xs font-medium text-muted"
            role="status"
          >
            <WifiOff className="h-4 w-4" aria-hidden />
            You are offline — showing cached / fallback catalog.
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search products..."
            value={query}
            aria-label="Search products"
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="max-w-xs"
          />
          <select
            value={sort}
            aria-label="Sort products"
            onChange={(e) => setSort(e.target.value)}
            className="rounded-[16px] border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={cn(
              "rounded-[14px] border p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              view === "grid" ? "border-primary text-primary" : "border-border",
            )}
            onClick={() => setView("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === "list"}
            className={cn(
              "rounded-[14px] border p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              view === "list" ? "border-primary text-primary" : "border-border",
            )}
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[16px] border border-border bg-white px-4 py-3 text-sm font-semibold text-navy lg:hidden"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className={cn("lg:block", filtersOpen ? "block" : "hidden")}>{Filters}</div>
          <div>
            {productsQuery.isLoading && !productsQuery.data ? (
              <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-[18px] border border-border bg-section" />
                ))}
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-[18px]",
                  view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
                )}
              >
                {pageItems.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
            {pageItems.length === 0 && !productsQuery.isLoading ? (
              <div className="rounded-[24px] border border-border bg-white p-10 text-center">
                <p className="text-muted">No products match these filters.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <CtaButton
                    label="Clear filters"
                    onClick={() => {
                      setBrand("");
                      setCondition("");
                      setRam("");
                      setStorage("");
                      setProcessor("");
                      setWarranty("");
                      setBatteryHealth("");
                      setQuery("");
                      setMaxPrice(200000);
                    }}
                  />
                  <CtaButton
                    label="Retry"
                    variant="secondary"
                    className="!border-border !text-navy"
                    onClick={() => void productsQuery.refetch()}
                  />
                </div>
              </div>
            ) : null}
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={page === n ? "page" : undefined}
                  className={cn(
                    "h-10 w-10 rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    page === n ? "bg-primary text-white" : "border border-border bg-white text-navy",
                  )}
                >
                  {n}
                </button>
              ))}
            </nav>
            {page < pages ? (
              <div className="mt-4 flex justify-center">
                <CtaButton
                  label="Load more"
                  variant="secondary"
                  className="!border-border !text-navy"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                />
              </div>
            ) : null}
          </div>
        </div>
      </PageShell>
    </StoreChrome>
  );
}
