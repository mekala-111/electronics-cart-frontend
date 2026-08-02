import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { ApiError, type ApiEnvelope } from "@/types/api";
import { endpoints } from "@/api/endpoints";
import { tokenStorage } from "@/api/token-storage";
import { isFirebaseAccessToken } from "@/lib/auth-token";
import { getApiBaseUrl } from "@/lib/env";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

const AUTH_NO_REFRESH = [
  endpoints.auth.login,
  endpoints.auth.register,
  endpoints.auth.refresh,
  endpoints.auth.firebase,
  endpoints.auth.forgotPassword,
  endpoints.auth.resetPassword,
  endpoints.auth.sendOtp,
  endpoints.auth.verifyOtp,
  endpoints.auth.verifyEmail,
  endpoints.auth.resendVerification,
];

function isAuthNoRefreshUrl(url?: string) {
  if (!url) return false;
  return AUTH_NO_REFRESH.some((path) => url.includes(path));
}

function clearSessionOnAuthFailure() {
  tokenStorage.clear();
  if (typeof window !== "undefined") {
    try {
      // Lazy import avoids circular init with store ↔ client
      void import("@/store").then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      });
    } catch {
      /* ignore */
    }
  }
}

async function refreshFirebaseAccessToken(): Promise<string | null> {
  const { getFirebaseAuth } = await import("@/lib/firebase");
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  const accessToken = await user.getIdToken(true);
  tokenStorage.setTokens(accessToken, user.refreshToken);
  return accessToken;
}

async function refreshNestAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;
  const { data } = await axios.post<
    ApiEnvelope<{ accessToken: string; refreshToken?: string }>
  >(
    `${getApiBaseUrl()}${endpoints.auth.refresh}`,
    { refreshToken },
    { headers: { Accept: "application/json" }, timeout: 15000 },
  );
  if (!data.success || !data.data?.accessToken) return null;
  tokenStorage.setTokens(data.data.accessToken, data.data.refreshToken ?? refreshToken);
  return data.data.accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const access = tokenStorage.getAccess();
    const next = isFirebaseAccessToken(access)
      ? await refreshFirebaseAccessToken()
      : await refreshNestAccessToken();
    if (!next) {
      clearSessionOnAuthFailure();
      return null;
    }
    return next;
  } catch {
    clearSessionOnAuthFailure();
    return null;
  }
}

function toApiError(error: unknown): ApiError {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return new ApiError({
      message: "You appear to be offline",
      code: "OFFLINE",
      status: 0,
      offline: true,
    });
  }

  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<ApiEnvelope<unknown>>;
    const body = ax.response?.data;
    if (body && typeof body === "object" && "success" in body && body.success === false) {
      return new ApiError({
        message: body.message || ax.message,
        code: body.code,
        status: ax.response?.status,
        errors: body.errors,
        requestId: body.requestId,
      });
    }
    return new ApiError({
      message: ax.message || "Network error",
      code: ax.code ?? "NETWORK_ERROR",
      status: ax.response?.status ?? 0,
    });
  }

  if (error instanceof ApiError) return error;
  return new ApiError({ message: error instanceof Error ? error.message : "Unknown error" });
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.headers["X-Session-Key"]) {
    config.headers["X-Session-Key"] = tokenStorage.getSessionKey();
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const shouldRefresh =
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthNoRefreshUrl(original.url);

    if (shouldRefresh) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const access = await refreshPromise;
      if (access) {
        original.headers.Authorization = `Bearer ${access}`;
        return apiClient(original);
      }
    }
    return Promise.reject(toApiError(error));
  },
);

/** Unwrap Nest `{ success, data, meta? }` envelopes */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.get<ApiEnvelope<T>>(url, { params });
  if (!data.success) {
    throw new ApiError({
      message: data.message,
      code: data.code,
      errors: data.errors,
      requestId: data.requestId,
    });
  }
  return data.data;
}

export async function apiGetPaginated<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<{ items: T[]; meta?: import("@/types/api").PaginationMeta }> {
  const { data } = await apiClient.get<ApiEnvelope<T[]> & { meta?: import("@/types/api").PaginationMeta }>(
    url,
    { params },
  );
  if (!data.success) {
    throw new ApiError({
      message: data.message,
      code: data.code,
      errors: data.errors,
      requestId: data.requestId,
    });
  }
  return { items: data.data, meta: data.meta };
}

export async function apiMutate<T>(
  method: "post" | "patch" | "put" | "delete",
  url: string,
  body?: unknown,
  opts?: { idempotencyKey?: string; params?: Record<string, unknown> },
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts?.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;
  const { data } = await apiClient.request<ApiEnvelope<T>>({
    method,
    url,
    data: body,
    headers,
    params: opts?.params,
  });
  if (!data.success) {
    throw new ApiError({
      message: data.message,
      code: data.code,
      errors: data.errors,
      requestId: data.requestId,
    });
  }
  return data.data;
}

/** @deprecated Prefer `apiClient` / `apiGet` — kept for existing imports */
export const api = apiClient;
