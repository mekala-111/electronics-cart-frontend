import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, "aria-invalid": invalid, disabled, ...props }, ref) => (
    <input
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid}
      className={cn(
        "w-full rounded-[16px] border border-border bg-white px-4 py-3 text-sm text-navy outline-none transition",
        "placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/15",
        "disabled:cursor-not-allowed disabled:bg-section disabled:opacity-60",
        invalid && "border-danger focus:border-danger focus:ring-danger/15",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
