"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/shared/spinner";

/** Flutter CtaButton — loading / focus / disabled polish */
export function CtaButton({
  label,
  variant = "primary",
  showArrow,
  className,
  onClick,
  type = "button",
  disabled,
  loading,
}: {
  label: string;
  variant?: "primary" | "secondary";
  showArrow?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
}) {
  const primary = variant === "primary";
  const busy = Boolean(loading || disabled);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy}
      aria-busy={loading || undefined}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-[16px] px-7 py-4 text-[15px] font-semibold tracking-[0.2px] text-white transition duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        "active:scale-[0.98]",
        primary &&
          "bg-primary shadow-[0_6px_14px_rgba(30,94,255,0.35)] hover:-translate-y-[3px] hover:shadow-[0_10px_22px_rgba(30,94,255,0.55)]",
        !primary &&
          "border-[1.5px] border-white/85 bg-transparent hover:bg-white/12",
        busy && "pointer-events-none opacity-60",
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-white/20 transition duration-500 group-active:translate-x-0"
        aria-hidden
      />
      {loading ? <Spinner className="mr-2 h-[18px] w-[18px]" /> : null}
      {label}
      {showArrow && !loading ? (
        <ArrowRight className="ml-2 h-[18px] w-[18px] transition duration-200 group-hover:translate-x-[5px]" />
      ) : null}
    </button>
  );
}
