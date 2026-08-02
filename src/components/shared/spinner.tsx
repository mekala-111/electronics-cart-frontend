"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared spinner for buttons and inline loading. */
export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <Loader2
      className={cn("h-4 w-4 animate-spin", className)}
      aria-label={label}
      role="status"
    />
  );
}
