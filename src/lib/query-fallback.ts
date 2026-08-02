import { ApiError } from "@/types/api";
import { allowApiFallbacks } from "@/lib/env";

export type DataSource = "api" | "fallback";

export type DataResult<T> = {
  data: T;
  source: DataSource;
  degraded: boolean;
};

/** True when we should serve mock/cached UI instead of failing the page. */
export function shouldUseFallback(error: unknown): boolean {
  if (!allowApiFallbacks) return false;
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (error instanceof ApiError) {
    if (error.offline) return true;
    if (error.status === 0) return true;
    if ([408, 500, 502, 503, 504].includes(error.status)) return true;
    if (error.code === "ECONNABORTED" || error.code === "NETWORK_ERROR") return true;
    return false;
  }
  return true;
}

/**
 * Prefer live API data.
 * In production (`allowApiFallbacks === false`), never substitutes mocks —
 * empty results and errors propagate to the UI.
 */
export async function withApiFallback<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  opts?: { treatEmptyAsFallback?: boolean; isEmpty?: (value: T) => boolean },
): Promise<DataResult<T>> {
  try {
    const data = await fetcher();
    const empty =
      opts?.treatEmptyAsFallback &&
      allowApiFallbacks &&
      (opts.isEmpty
        ? opts.isEmpty(data)
        : Array.isArray(data)
          ? data.length === 0
          : data == null);
    if (empty) {
      return { data: fallback, source: "fallback", degraded: true };
    }
    return { data, source: "api", degraded: false };
  } catch (error) {
    if (shouldUseFallback(error)) {
      return { data: fallback, source: "fallback", degraded: true };
    }
    throw error;
  }
}

export function isDegradedSource(source?: DataSource) {
  return source === "fallback";
}
