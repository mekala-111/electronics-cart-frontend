import { ProfileShell } from "@/features/profile/profile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SupportTicketsPage() {
  return (
    <ProfileShell title="Support Tickets">
      <div className="mb-6 rounded-[18px] border border-border p-4">
        <p className="font-bold text-navy">#TKT-2201 · Battery query</p>
        <p className="mt-1 text-sm text-muted">Open · Updated 2 hours ago</p>
      </div>
      <div className="space-y-3">
        <Input placeholder="Subject" />
        <textarea
          className="min-h-28 w-full rounded-[16px] border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          placeholder="Describe your issue..."
        />
        <Button>Create Ticket</Button>
      </div>
    </ProfileShell>
  );
}
