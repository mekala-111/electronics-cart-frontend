"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { useSessionRestore } from "@/hooks/use-auth";
import { tokenStorage } from "@/api/token-storage";
import { Spinner } from "@/components/shared/spinner";

export function SessionRestore() {
  useSessionRestore();
  return null;
}

function loginRedirect(admin?: boolean, nextPath?: string | null) {
  const fallback = admin ? "/admin" : "/profile";
  const next = nextPath && nextPath.startsWith("/") ? nextPath : fallback;
  return `/auth/login?next=${encodeURIComponent(next)}`;
}

export function RequireAuth({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const hasToken = typeof window !== "undefined" && Boolean(tokenStorage.getAccess());
  const restore = useSessionRestore();

  const restoring = hasToken && !user && (restore.isPending || restore.isFetching);
  const unauthenticated = !user && !hasToken;
  const forbiddenAdmin = Boolean(admin && user && !isAdmin());

  useEffect(() => {
    if (restoring) return;
    if (unauthenticated) {
      router.replace(loginRedirect(admin, pathname));
      return;
    }
    if (forbiddenAdmin) {
      router.replace("/profile");
    }
  }, [admin, forbiddenAdmin, pathname, restoring, router, unauthenticated]);

  if (restoring) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 p-8 text-sm text-muted">
        <Spinner className="h-5 w-5" />
        Restoring session…
      </div>
    );
  }

  if (unauthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-muted">
        Redirecting to sign in…
      </div>
    );
  }

  if (forbiddenAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-muted">
        Admin access required…
      </div>
    );
  }

  return <>{children}</>;
}
