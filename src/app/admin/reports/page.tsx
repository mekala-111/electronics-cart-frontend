import { AdminShell } from "@/features/admin/admin-shell";

export default function AdminReportsPage() {
  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Reports & <span className="text-accent">Analytics</span>
      </h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {["Revenue by category", "Conversion funnel", "Warranty claims", "Refund rate"].map((t) => (
          <div key={t} className="rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-bold text-navy">{t}</h2>
            <div className="mt-6 h-32 rounded-[16px] bg-gradient-to-br from-primary/15 to-accent/10" />
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
