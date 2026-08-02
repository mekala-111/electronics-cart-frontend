"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Mic, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounce";

/** Flutter EcSearchBar — 48px, radius 28 */
export function EcSearchBar({ className }: { className?: string }) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 400);
  const router = useRouter();

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const q = (query || debounced).trim();
    if (!q) {
      router.push("/products");
      return;
    }
    router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex h-12 items-center rounded-[28px] bg-search transition duration-200",
        focused
          ? "border-[1.5px] border-primary shadow-[0_4px_12px_rgba(30,94,255,0.18)]"
          : "border-[1.5px] border-transparent",
        className,
      )}
      role="search"
    >
      <div className="w-[18px]" />
      <input
        className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-nav-muted/70"
        placeholder="Search for laptops, brands, specs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Search products"
        autoComplete="off"
      />
      <button type="button" className="p-1 text-nav-muted/80" aria-label="Voice search unavailable" disabled>
        <Mic className="h-5 w-5" aria-hidden />
      </button>
      <div className="w-2" />
      <button
        type="submit"
        className="m-0.5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-[0_3px_10px_rgba(30,94,255,0.35)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label="Search"
      >
        <Search className="h-[22px] w-[22px]" aria-hidden />
      </button>
    </form>
  );
}
