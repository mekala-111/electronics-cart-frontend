"use client";

import { AdminShell } from "@/features/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminProductFormPage() {
  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Add / Edit <span className="text-accent">Product</span>
      </h1>
      <form className="mt-8 grid max-w-3xl gap-4 rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
        <Input placeholder="Product name" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input placeholder="Brand" />
          <Input placeholder="SKU" />
          <Input placeholder="Price" type="number" />
          <Input placeholder="MRP" type="number" />
        </div>
        <Input placeholder="Specs (RAM · Storage · CPU)" />
        <textarea
          className="min-h-28 rounded-[16px] border border-border px-4 py-3 text-sm outline-none focus:border-primary"
          placeholder="Description"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input placeholder="SEO title" />
          <Input placeholder="SEO slug" />
        </div>
        <p className="text-sm text-muted">Images · Variants · Battery health — wired to media & inventory APIs.</p>
        <div className="flex gap-3">
          <Button type="button">Save product</Button>
          <Button type="button" variant="outline">
            Save draft
          </Button>
        </div>
      </form>
    </AdminShell>
  );
}
