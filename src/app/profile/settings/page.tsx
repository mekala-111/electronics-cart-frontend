"use client";

import { useRouter } from "next/navigation";
import { ProfileShell } from "@/features/profile/profile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequireAuth } from "@/components/shared/require-auth";
import { useAuthStore } from "@/store";
import { useLogout } from "@/hooks/use-auth";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const router = useRouter();

  return (
    <RequireAuth>
      <ProfileShell title="Account Settings">
        <div className="max-w-md space-y-4">
          <Input defaultValue={user?.name ?? ""} placeholder="Name" />
          <Input defaultValue={user?.email ?? ""} placeholder="Email" />
          <Button>Save changes</Button>
          <Button
            variant="outline"
            onClick={async () => {
              await logout.mutateAsync();
              router.push("/auth/login");
            }}
          >
            Sign out
          </Button>
        </div>
      </ProfileShell>
    </RequireAuth>
  );
}
