"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/api/token-storage";
import { queryKeys } from "@/hooks/query-keys";
import { useAuthStore } from "@/store";
import { ApiError } from "@/types/api";
import { prefetchWishlist } from "@/hooks/use-wishlist";
import { prefetchAddresses } from "@/hooks/use-addresses";
import {
  firebaseGoogleSignIn,
  firebaseLogout,
  firebaseSendOtp,
  firebaseVerifyOtp,
  subscribeFirebaseAuth,
} from "@/lib/firebase-auth";
import { isFirebaseAccessToken } from "@/lib/auth-token";
import {
  hasAdminRole,
  meToSessionUser,
  toSessionUser,
  type AuthSessionResponse,
  type LoginPayload,
  type RegisterPayload,
} from "@/types/auth";

function useHasAccessToken() {
  return typeof window !== "undefined" && Boolean(tokenStorage.getAccess());
}

function applyAuthSuccess(
  data: AuthSessionResponse,
  setSession: (u: ReturnType<typeof toSessionUser>) => void,
) {
  if (!data.accessToken || !data.refreshToken) {
    throw new ApiError({
      message: "Authentication response missing tokens",
      code: "INVALID_AUTH_RESPONSE",
      status: 500,
    });
  }
  tokenStorage.setTokens(data.accessToken, data.refreshToken);
  setSession(toSessionUser(data));
}

/** Firebase Google/OTP → Nest JWT so wishlist/orders/addresses work. */
async function exchangeFirebaseForNest(
  firebaseSession: AuthSessionResponse,
): Promise<AuthSessionResponse> {
  const nest = await authService.firebase(firebaseSession.accessToken);
  return {
    ...nest,
    user: {
      ...(nest.user ?? { id: "" }),
      name: nest.user?.name || firebaseSession.user?.name,
      email: nest.user?.email || firebaseSession.user?.email,
    },
  };
}

/**
 * Restores session from Nest JWT (email login) or Firebase (Google / phone OTP).
 * Firebase sessions are exchanged for Nest JWTs on restore.
 */
export function useSessionRestore() {
  const setSession = useAuthStore((s) => s.setSession);
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();
  const enabled = useHasAccessToken();

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const access = tokenStorage.getAccess();

      if (isFirebaseAccessToken(access)) {
        return await new Promise<{
          id: string;
          email?: string | null;
          name?: string | null;
          roles: string[];
        }>((resolve, reject) => {
          const unsub = subscribeFirebaseAuth(async (user) => {
            unsub();
            if (!user) {
              logout();
              reject(
                new ApiError({
                  message: "Session expired",
                  code: "UNAUTHORIZED",
                  status: 401,
                }),
              );
              return;
            }
            try {
              const idToken = await user.getIdToken();
              const nest = await authService.firebase(idToken);
              applyAuthSuccess(nest, setSession);
              void prefetchWishlist(qc);
              void prefetchAddresses(qc);
              resolve({
                id: nest.user?.id ?? user.uid,
                email: nest.user?.email ?? user.email,
                name: nest.user?.name ?? user.displayName,
                roles: nest.roles ?? [],
              });
            } catch (err) {
              logout();
              tokenStorage.clear();
              reject(err);
            }
          });
        });
      }

      const me = await authService.me();
      setSession(meToSessionUser(me));
      void prefetchWishlist(qc);
      void prefetchAddresses(qc);
      return {
        id: me.user.id,
        email: me.user.email,
        name: me.user.name,
        roles: me.roles,
      };
    },
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/** @deprecated Prefer useSessionRestore — alias kept for existing imports */
export function useMe() {
  return useSessionRestore();
}

export function useLogin() {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      applyAuthSuccess(data, setSession);
      void qc.invalidateQueries({ queryKey: queryKeys.me });
      void prefetchWishlist(qc);
      void prefetchAddresses(qc);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      applyAuthSuccess(data, setSession);
      void qc.invalidateQueries({ queryKey: queryKeys.me });
      void prefetchWishlist(qc);
      void prefetchAddresses(qc);
    },
  });
}

export function useGoogleSignIn() {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async () => {
      const firebaseSession = await firebaseGoogleSignIn();
      return exchangeFirebaseForNest(firebaseSession);
    },
    onSuccess: (data) => {
      applyAuthSuccess(data, setSession);
      void qc.invalidateQueries({ queryKey: queryKeys.me });
      void prefetchWishlist(qc);
      void prefetchAddresses(qc);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (identifier: string) => authService.forgotPassword(identifier),
  });
}

const RECAPTCHA_CONTAINER_ID = "firebase-recaptcha";

export function useSendOtp() {
  return useMutation({
    mutationFn: (destination: string) =>
      firebaseSendOtp(destination, RECAPTCHA_CONTAINER_ID),
  });
}

export function useVerifyOtp() {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (payload: { destination: string; code: string }) => {
      const firebaseSession = await firebaseVerifyOtp(payload.code);
      return exchangeFirebaseForNest(firebaseSession);
    },
    onSuccess: (data) => {
      applyAuthSuccess(data, setSession);
      void qc.invalidateQueries({ queryKey: queryKeys.me });
      void prefetchWishlist(qc);
      void prefetchAddresses(qc);
    },
  });
}

export { RECAPTCHA_CONTAINER_ID };

export function useLogout() {
  const qc = useQueryClient();
  const logoutLocal = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      const access = tokenStorage.getAccess();
      const refresh = tokenStorage.getRefresh() ?? undefined;
      try {
        if (isFirebaseAccessToken(access)) {
          await firebaseLogout();
        } else {
          await authService.logout(refresh);
          // Also clear Firebase if a Google/OTP session was started this browser
          try {
            await firebaseLogout();
          } catch {
            /* ignore */
          }
        }
      } finally {
        tokenStorage.clear();
      }
    },
    onSettled: () => {
      logoutLocal();
      void qc.clear();
    },
  });
}

export function postLoginPath(roles?: string[] | null) {
  return hasAdminRole(roles) ? "/admin" : "/profile";
}
