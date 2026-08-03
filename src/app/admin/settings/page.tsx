"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/features/admin/admin-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/use-commerce";

export default function AdminSettingsPage() {
  const { data, isLoading } = useAdminSettings();
  const update = useUpdateAdminSettings();
  const [storeName, setStoreName] = useState("Electronics Cart");
  const [supportPhone, setSupportPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setStoreName(data.storeName || "Electronics Cart");
    setSupportPhone(data.supportPhone || "");
    setGstin(data.gstin || "");
  }, [data]);

  async function onSave() {
    setMsg(null);
    try {
      await update.mutateAsync({ storeName, supportPhone, gstin });
      setMsg("Saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Admin <span className="text-accent">Settings</span>
      </h1>
      {isLoading && !data ? (
        <div className="mt-8 h-48 max-w-lg animate-pulse rounded-[24px] bg-section" />
      ) : (
        <div className="mt-8 max-w-lg space-y-4 rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
          <Input
            placeholder="Store name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
          <Input
            placeholder="Support phone"
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
          />
          <Input placeholder="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} />
          {msg && <p className="text-sm text-muted">{msg}</p>}
          <Button onClick={onSave} disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </AdminShell>
  );
}
