"use client";

import { CtaButton } from "@/components/shared/cta-button";
import { useToast } from "@/components/shared/toast";
import { useLogin } from "@/hooks/use-auth";
import { useAuthStore } from "@/store";
import { useRouter } from "next/navigation";

/** Dev-only credentials — this module must not be imported from production entry paths. */
const DEMO_ADMIN = {
  email: "admin@electronicscart.in",
  password: "Admin@12345",
  name: "Admin",
  roles: ["admin", "super_admin"] as string[],
} as const;

type Props = {
  setValue: (name: "email" | "password", value: string) => void;
};

/**
 * Isolated demo controls for local development.
 * Gated by `allowDemoAuth` at the call site so production bundles can tree-shake this.
 */
export function DemoAuthPanel({ setValue }: Props) {
  const loginMutation = useLogin();
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  const toast = useToast();

  return (
    <>
      <button
        type="button"
        className="mt-3 w-full text-center text-xs font-medium text-subtext underline-offset-2 hover:text-white hover:underline"
        onClick={() => {
          setValue("email", DEMO_ADMIN.email);
          setValue("password", DEMO_ADMIN.password);
        }}
      >
        Use admin demo credentials
      </button>

      <CtaButton
        type="button"
        label="Admin console login"
        variant="secondary"
        className="mt-3 w-full"
        onClick={async () => {
          setValue("email", DEMO_ADMIN.email);
          setValue("password", DEMO_ADMIN.password);
          try {
            await loginMutation.mutateAsync({
              identifier: DEMO_ADMIN.email,
              password: DEMO_ADMIN.password,
            });
            toast.success("Admin session", "Opening console…");
            router.push("/admin");
          } catch {
            // Dev-only offline path when Nest auth is unreachable
            setSession({
              name: DEMO_ADMIN.name,
              email: DEMO_ADMIN.email,
              roles: [...DEMO_ADMIN.roles],
            });
            toast.success("Admin session (offline)", "Opening console…");
            router.push("/admin");
          }
        }}
      />
    </>
  );
}
