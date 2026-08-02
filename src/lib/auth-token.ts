/** Detect Firebase ID tokens vs Nest JWTs (both are JWTs). */

export function isFirebaseAccessToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return Boolean(payload?.firebase) || payload?.iss?.includes("securetoken.google.com");
  } catch {
    return false;
  }
}
