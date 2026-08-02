const ACCESS_KEY = "ec-token";
const REFRESH_KEY = "ec-refresh-token";
const SESSION_KEY = "ec-session-key";

function canUseStorage() {
  return typeof window !== "undefined";
}

export const tokenStorage = {
  getAccess(): string | null {
    if (!canUseStorage()) return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    if (!canUseStorage()) return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens(access: string, refresh?: string) {
    if (!canUseStorage()) return;
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (!canUseStorage()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  getSessionKey(): string {
    if (!canUseStorage()) return "ssr";
    let key = localStorage.getItem(SESSION_KEY);
    if (!key) {
      key =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SESSION_KEY, key);
    }
    return key;
  },
};
