/** Shared API envelope types matching Nest ResponseInterceptor */

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ApiFailure = {
  success: false;
  code: string;
  message: string;
  errors: unknown[];
  requestId?: string;
  correlationId?: string;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly errors: unknown[];
  readonly requestId?: string;
  readonly offline: boolean;

  constructor(opts: {
    message: string;
    code?: string;
    status?: number;
    errors?: unknown[];
    requestId?: string;
    offline?: boolean;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.code = opts.code ?? "UNKNOWN";
    this.status = opts.status ?? 0;
    this.errors = opts.errors ?? [];
    this.requestId = opts.requestId;
    this.offline = opts.offline ?? false;
  }

  get isUnauthorized() {
    return this.status === 401 || this.code === "UNAUTHORIZED";
  }

  get isForbidden() {
    return this.status === 403 || this.code === "FORBIDDEN";
  }

  get isNotFound() {
    return this.status === 404 || this.code === "NOT_FOUND";
  }

  get isConflict() {
    return this.status === 409 || this.code === "CONFLICT";
  }

  get isValidation() {
    return this.status === 422 || this.code === "VALIDATION_ERROR";
  }

  get isRateLimited() {
    return this.status === 429 || this.code === "RATE_LIMITED";
  }

  get isServerError() {
    return this.status >= 500;
  }

  get isExpiredToken() {
    return this.code === "TOKEN_EXPIRED" || this.code === "SESSION_EXPIRED";
  }
}

/** User-facing copy for checkout / mutation failures */
export function describeApiError(error: unknown, fallback = "Something went wrong"): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : fallback;
  }
  if (error.offline) return "You appear offline. Reconnect and try again.";
  if (error.isUnauthorized || error.isExpiredToken) return "Please sign in again to continue.";
  if (error.isForbidden) return "You don’t have permission for this action.";
  if (error.isNotFound) return error.message || "Resource not found.";
  if (error.isConflict) return error.message || "This action conflicts with the current state.";
  if (error.isValidation) {
    const first =
      Array.isArray(error.errors) && error.errors.length
        ? String(
            typeof error.errors[0] === "object" &&
              error.errors[0] &&
              "message" in (error.errors[0] as object)
              ? (error.errors[0] as { message?: string }).message
              : error.errors[0],
          )
        : null;
    return first || error.message || "Please check the form and try again.";
  }
  if (error.isRateLimited) return "Too many requests. Wait a moment and retry.";
  if (error.isServerError) return error.message || "Server error. Please try again.";
  if (error.status === 408 || error.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }
  return error.message || fallback;
}
