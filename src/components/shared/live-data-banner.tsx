"use client";

import { cn } from "@/lib/utils";

/** Subtle non-breaking notice when mock fallback is active. */
export function LiveDataBanner({
  show,
  className,
  message = "Live data temporarily unavailable",
}: {
  show?: boolean;
  className?: string;
  message?: string;
}) {
  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-[14px] border border-border bg-section px-4 py-2.5 text-center text-xs font-medium text-muted",
        className,
      )}
    >
      {message}
    </div>
  );
}
