import { AdminShell } from "@/features/admin/admin-shell";

export default function AdminCustomersPage() {
  return (
    <AdminShell>
      <h1 className="text-3xl font-extrabold text-navy">
        Cust<span className="text-accent">omers</span>
      </h1>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-border bg-white shadow-[var(--shadow-soft)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-section text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">LTV</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Ananya Reddy", "ananya@email.com", "4", "₹2.1L"],
              ["Karthik Rao", "karthik@email.com", "2", "₹96k"],
              ["Meera Shah", "meera@email.com", "3", "₹1.4L"],
            ].map((r) => (
              <tr key={r[0]} className="border-b border-border/70">
                {r.map((c) => (
                  <td key={c} className="px-4 py-3 font-medium text-navy">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
