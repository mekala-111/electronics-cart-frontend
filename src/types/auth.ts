export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

export type AuthUser = {
  id: string;
  email?: string | null;
  mobile?: string | null;
  name?: string | null;
  userType?: string | null;
  roles?: string[];
  permissions?: string[];
  emailVerified?: boolean;
};

/** Nest login/register envelope `data` payload */
export type AuthSessionResponse = AuthTokens & {
  user?: AuthUser;
  roles?: string[];
  permissions?: string[];
  sessionId?: string;
};

/** Nest GET /auth/me envelope `data` payload */
export type AuthMeResponse = {
  user: AuthUser;
  roles: string[];
  permissions?: string[];
  sessionId?: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  email?: string;
  mobile?: string;
  password: string;
  name?: string;
};

export type SessionUser = {
  id?: string;
  name: string;
  email: string;
  roles?: string[];
};

export function hasAdminRole(roles?: string[] | null) {
  return (roles ?? []).some((r) => r === "admin" || r === "super_admin");
}

export function toSessionUser(data: AuthSessionResponse): SessionUser {
  const roles = data.roles ?? data.user?.roles;
  return {
    id: data.user?.id,
    name: data.user?.name || data.user?.email || "Customer",
    email: data.user?.email || "",
    roles,
  };
}

export function meToSessionUser(res: AuthMeResponse): SessionUser {
  return {
    id: res.user.id,
    name: res.user.name || res.user.email || "Customer",
    email: res.user.email || "",
    roles: res.roles,
  };
}
