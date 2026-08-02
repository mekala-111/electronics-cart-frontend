"use client";

import { useEffect } from "react";
import { CtaButton } from "@/components/shared/cta-button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      void error;
    }
  }, [error]);

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center"
      role="alert"
    >
      <h2 className="text-2xl font-extrabold text-navy">
        Admin error
      </h2>
      <p className="max-w-md text-sm text-muted">
        {error.message || "The admin console hit an unexpected error."}
      </p>
      <CtaButton label="Try again" onClick={reset} />
    </div>
  );
}
