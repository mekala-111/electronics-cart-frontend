"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/types/api";
import { SessionRestore } from "@/components/shared/require-auth";
import { ToastProvider } from "@/components/shared/toast";
import { AppErrorBoundary } from "@/components/shared/error-boundary";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60_000,
        gcTime: 10 * 60_000,
        // Avoid refetch storms when switching browser tabs (remote API is latency-heavy).
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            if (error.offline || error.isUnauthorized || error.isForbidden || error.isNotFound) {
              return false;
            }
            if (error.isServerError || error.status === 0) return failureCount < 1;
          }
          return failureCount < 1;
        },
      },
      mutations: { retry: 0 },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <AppErrorBoundary>
          <SessionRestore />
          {children}
        </AppErrorBoundary>
      </ToastProvider>
    </QueryClientProvider>
  );
}
