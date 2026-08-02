import { AdminShell } from "@/features/admin/admin-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Admin <span className="text-accent">Settings</span>
      </h1>
      <div className="mt-8 max-w-lg space-y-4 rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
        <Input placeholder="Store name" defaultValue="Electronics Cart" />
        <Input placeholder="Support phone" defaultValue="040-4856 7878" />
        <Input placeholder="GSTIN" />
        <Button>Save</Button>
      </div>
    </AdminShell>
  );
}
