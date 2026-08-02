/**
 * Central public env access. Prefer these helpers over scattered process.env reads.
 * Server secrets must never use the NEXT_PUBLIC_ prefix.
 *
 * IMPORTANT: Next.js only inlines `process.env.NEXT_PUBLIC_*` when the key is a
 * static string literal. Dynamic `process.env[name]` is undefined in the browser.
 */

function trimEnv(value: string | undefined): string | undefined {
  return value?.trim() ? value.trim() : undefined;
}

const DEFAULT_API_URL = "https://api.gdcd.online/api";
const DEFAULT_SITE_URL = "https://electronicscart.in";

/**
 * Nest API base including `/api` suffix.
 * Relative values (e.g. `/backend-api`) go through Next rewrites — same-origin in the browser,
 * which avoids CORS when developing against a remote API that does not allow localhost.
 */
export function getApiBaseUrl(): string {
  const configured =
    trimEnv(process.env.NEXT_PUBLIC_API_URL) ?? DEFAULT_API_URL;
  if (configured.startsWith("/") && typeof window === "undefined") {
    const port = process.env.PORT ?? "3000";
    return `http://127.0.0.1:${port}${configured}`;
  }
  return configured;
}

/** Canonical storefront origin (no trailing slash) */
export function getSiteUrl(): string {
  const raw = trimEnv(process.env.NEXT_PUBLIC_SITE_URL) ?? DEFAULT_SITE_URL;
  return raw.replace(/\/$/, "");
}

/**
 * Demo auth (credential autofill / offline admin) — never in production builds.
 * Enable locally with NEXT_PUBLIC_ALLOW_DEMO_AUTH=true
 */
export const allowDemoAuth =
  process.env.NODE_ENV !== "production" &&
  trimEnv(process.env.NEXT_PUBLIC_ALLOW_DEMO_AUTH) === "true";

/**
 * Mock/API fallbacks for catalog & commerce — never in production builds.
 * Dev default: on. Disable with NEXT_PUBLIC_ALLOW_API_FALLBACKS=false
 */
export const allowApiFallbacks =
  process.env.NODE_ENV !== "production" &&
  trimEnv(process.env.NEXT_PUBLIC_ALLOW_API_FALLBACKS) !== "false";

/**
 * Origin pincode for shipping estimates (warehouse postal not on list API).
 * Override with NEXT_PUBLIC_ORIGIN_PINCODE.
 */
export function getOriginPincode(): string {
  return trimEnv(process.env.NEXT_PUBLIC_ORIGIN_PINCODE) ?? "500001";
}

export const env = {
  apiBaseUrl: getApiBaseUrl(),
  siteUrl: getSiteUrl(),
  allowDemoAuth,
  allowApiFallbacks,
  originPincode: getOriginPincode(),
  isProd: process.env.NODE_ENV === "production",
  isDev: process.env.NODE_ENV === "development",
} as const;
