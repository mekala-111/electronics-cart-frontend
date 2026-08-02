"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { ApiError } from "@/types/api";
import { CtaButton } from "@/components/shared/cta-button";
import { cn } from "@/lib/utils";

type QueryStateProps = {
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  onRefresh?: () => void;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function messageFromError(error: unknown): { title: string; detail: string; offline: boolean } {
  if (error instanceof ApiError) {
    if (error.offline) {
      return { title: "You are offline", detail: "Reconnect and try again.", offline: true };
    }
    if (error.isUnauthorized || error.isExpiredToken) {
      return {
        title: error.isExpiredToken ? "Session expired" : "Sign in required",
        detail: "Please sign in again to continue.",
        offline: false,
      };
    }
    if (error.isForbidden) {
      return {
        title: "Access denied",
        detail: error.message || "You don’t have permission to view this.",
        offline: false,
      };
    }
    if (error.isConflict) {
      return {
        title: "Conflict",
        detail: error.message || "This action can’t be completed right now.",
        offline: false,
      };
    }
    if (error.isValidation) {
      return {
        title: "Invalid request",
        detail: error.message || "Please check your input and try again.",
        offline: false,
      };
    }
    if (error.isRateLimited) {
      return {
        title: "Too many requests",
        detail: "Wait a moment and try again.",
        offline: false,
      };
    }
    if (error.status === 408 || error.code === "ECONNABORTED") {
      return {
        title: "Timed out",
        detail: "The request took too long. Please retry.",
        offline: false,
      };
    }
    if (error.isServerError) {
      return {
        title: "Server error",
        detail: error.message || "Something went wrong on our side.",
        offline: false,
      };
    }
    return { title: "Couldn’t load data", detail: error.message, offline: false };
  }
  if (error instanceof Error) {
    return { title: "Couldn’t load data", detail: error.message, offline: false };
  }
  return { title: "Couldn’t load data", detail: "Please try again.", offline: false };
}

/** Shared Loading / Empty / Error / Offline / Retry surface for React Query pages. */
export function QueryState({
  isLoading,
  isFetching,
  isError,
  error,
  isEmpty,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Check back soon or adjust your filters.",
  onRetry,
  onRefresh,
  skeleton,
  children,
  className,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className={cn("w-full", className)} aria-busy="true" aria-live="polite">
        {skeleton ?? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-[18px] border border-border bg-section"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isError) {
    const msg = messageFromError(error);
    return (
      <div
        className={cn(
          "flex flex-col items-start gap-3 rounded-[18px] border border-border bg-white p-6",
          className,
        )}
        role="alert"
      >
        {msg.offline ? <WifiOff className="h-5 w-5 text-muted" aria-hidden /> : null}
        <div>
          <p className="text-base font-bold text-navy">{msg.title}</p>
          <p className="mt-1 text-sm text-muted">{msg.detail}</p>
        </div>
        {onRetry ? (
          <CtaButton
            type="button"
            label="Retry"
            variant="secondary"
            onClick={onRetry}
            className="!px-4 !py-2 text-sm"
          />
        ) : null}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        className={cn(
          "rounded-[18px] border border-dashed border-border bg-white p-8 text-center",
          className,
        )}
      >
        <p className="text-base font-bold text-navy">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted">{emptyDescription}</p>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <RefreshCw className="h-4 w-4" aria-hidden /> Refresh
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isFetching ? (
        <span className="sr-only" aria-live="polite">
          Refreshing…
        </span>
      ) : null}
      {children}
    </div>
  );
}
