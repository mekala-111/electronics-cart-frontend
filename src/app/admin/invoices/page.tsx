import { AdminShell } from "@/features/admin/admin-shell";

export default function AdminInvoicesPage() {
  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Invo<span className="text-accent">ices</span>
      </h1>
      <ul className="mt-6 space-y-3">
        {["INV-10482", "INV-10481", "INV-10480"].map((id) => (
          <li
            key={id}
            className="flex items-center justify-between rounded-[18px] border border-border bg-white px-4 py-3 shadow-[var(--shadow-soft)]"
          >
            <span className="font-semibold text-navy">{id}</span>
            <button type="button" className="text-sm font-semibold text-primary">
              Download
            </button>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
