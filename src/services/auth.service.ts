import { apiGet, apiMutate } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  AuthMeResponse,
  AuthSessionResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export const authService = {
  login: (payload: LoginPayload) =>
    apiMutate<AuthSessionResponse>("post", endpoints.auth.login, payload),
  register: (payload: RegisterPayload) =>
    // Nest RegisterDto only accepts email | mobile | password (forbidNonWhitelisted)
    apiMutate<AuthSessionResponse>("post", endpoints.auth.register, {
      email: payload.email,
      mobile: payload.mobile,
      password: payload.password,
    }),
  /** Exchange Firebase ID token for Nest JWT (Google / phone OTP). */
  firebase: (idToken: string) =>
    apiMutate<AuthSessionResponse>("post", endpoints.auth.firebase, { idToken }),
  me: () => apiGet<AuthMeResponse>(endpoints.auth.me),
  logout: (refreshToken?: string) =>
    apiMutate("post", endpoints.auth.logout, { refreshToken }),
  forgotPassword: (identifier: string) =>
    apiMutate("post", endpoints.auth.forgotPassword, { identifier }),
  resetPassword: (body: { destination: string; code: string; newPassword: string }) =>
    apiMutate("post", endpoints.auth.resetPassword, body),
  sendOtp: (body: { destination: string; channel: string; purpose: string }) =>
    apiMutate("post", endpoints.auth.sendOtp, body),
  verifyOtp: (body: { destination: string; purpose: string; code: string }) =>
    apiMutate("post", endpoints.auth.verifyOtp, body),
};
