"use client";

import { useEffect } from "react";
import { CtaButton } from "@/components/shared/cta-button";

export default function GlobalSegmentError({
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
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center"
      role="alert"
    >
      <p className="text-xs font-bold tracking-[1.6px] text-primary">ERROR</p>
      <h2 className="text-2xl font-extrabold text-navy">
        Something went <span className="text-accent">wrong</span>
      </h2>
      <p className="max-w-md text-sm text-muted">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <CtaButton label="Try again" onClick={reset} />
    </div>
  );
}
