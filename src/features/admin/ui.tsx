"use client";

import { cn, formatInr } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export function AdminStatCard({
  label,
  value,
  hint,
  trend,
  href,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: number | null;
  href?: string;
  className?: string;
}) {
  const display = typeof value === "number" ? formatInr(value) : value;
  const body = (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-4 shadow-[var(--shadow-soft)] transition hover:border-primary/30",
        className,
      )}
    >
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-navy">{display}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {typeof trend === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-semibold",
              trend >= 0 ? "text-success" : "text-danger",
            )}
          >
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {hint ? <span className="text-muted">{hint}</span> : null}
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block">
        {body}
      </a>
    );
  }
  return body;
}

export function AdminPanel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-navy">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminEmpty({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-section/60 px-6 py-12 text-center">
      <p className="font-semibold text-navy">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    </div>
  );
}

export function AdminSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-section", className ?? "h-40")} />;
}
