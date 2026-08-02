"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "@/components/shared/spinner";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[16px] font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-[15px]",
          size === "lg" && "px-8 py-4 text-base",
          variant === "primary" &&
            "bg-primary text-white shadow-[0_10px_24px_rgba(30,94,255,0.35)] hover:shadow-[0_14px_28px_rgba(30,94,255,0.5)]",
          variant === "secondary" &&
            "border border-white/80 bg-transparent text-white hover:bg-white/10",
          variant === "outline" &&
            "border border-border bg-white text-navy hover:border-primary hover:text-primary",
          variant === "ghost" && "text-primary hover:underline",
          className,
        )}
        {...props}
      >
        {loading ? <Spinner className="h-4 w-4" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
