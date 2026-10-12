import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAuth } from "./supabase";
import {
  findTeamByAuthUserId,
  findTeamByEmail,
  updateTeamMember,
} from "./store";
import type { TeamMember } from "./types";

const ACCESS_COOKIE = "netan_access_token";
const REFRESH_COOKIE = "netan_refresh_token";

type AuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
};

type AuthUser = {
  id: string;
  email?: string;
};

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function validatePassword(password: string) {
  if (
    password.length < 8 ||
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    throw new AuthError(
      400,
      "Use at least 8 characters with a letter and a number.",
    );
  }
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function setAuthCookies(tokens: AuthTokens, persist: boolean) {
  const jar = await cookies();
  jar.set(
    ACCESS_COOKIE,
    tokens.access_token,
    cookieOptions(tokens.expires_in || 60 * 60),
  );
  jar.set(
    REFRESH_COOKIE,
    tokens.refresh_token,
    cookieOptions(persist ? 60 * 60 * 24 * 30 : 60 * 60 * 24),
  );
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function signInWithPassword(email: string, password: string) {
  return supabaseAuth<AuthTokens>("/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function createAuthUser(input: {
  email: string;
  password: string;
  name: string;
  role: string;
}) {
  return supabaseAuth<AuthUser>(
    "/admin/users",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { name: input.name, role: input.role },
      }),
    },
    { admin: true },
  );
}

export async function updateAuthPassword(userId: string, password: string) {
  await supabaseAuth(
    `/admin/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify({ password }),
    },
    { admin: true },
  );
}

async function getAuthUser(accessToken: string) {
  try {
    return await supabaseAuth<AuthUser>("/user", { method: "GET" }, {
      accessToken,
    });
  } catch {
    return null;
  }
}

async function refreshTokens(refreshToken: string) {
  try {
    return await supabaseAuth<AuthTokens>("/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    return null;
  }
}

async function memberFromAuthUser(user: AuthUser) {
  const byId = await findTeamByAuthUserId(user.id);
  if (byId) return byId;
  if (!user.email) return null;
  const byEmail = await findTeamByEmail(user.email);
  if (byEmail && !byEmail.authUserId) {
    return updateTeamMember(byEmail.id, { authUserId: user.id });
  }
  return byEmail;
}

export async function getSession(): Promise<TeamMember | null> {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;

  if (access) {
    const user = await getAuthUser(access);
    if (user) {
      const member = await memberFromAuthUser(user);
      if (member && member.status === "Active") return member;
    }
  }

  if (refresh) {
    const tokens = await refreshTokens(refresh);
    if (tokens?.access_token) {
      await setAuthCookies(tokens, true);
      const user = await getAuthUser(tokens.access_token);
      if (user) {
        const member = await memberFromAuthUser(user);
        if (member && member.status === "Active") return member;
      }
    }
  }

  return null;
}

export async function requireAdmin() {
  const member = await getSession();
  if (!member) throw new AuthError(401, "Sign in required.");
  return member;
}

export async function requireWriter() {
  const member = await requireAdmin();
  if (member.role === "Viewer") {
    throw new AuthError(403, "You don't have permission to make changes.");
  }
  return member;
}

export function handleRouteError(err: unknown) {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Request failed" },
    { status: 500 },
  );
}

export function publicAdmin(member: TeamMember) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    initials: member.initials,
    role: member.role,
    status: member.status,
    avatarUrl: member.avatarUrl || null,
    notifyClient: member.notifyClient,
    notifyPayment: member.notifyPayment,
    notifyService: member.notifyService,
    notifyTeam: member.notifyTeam,
    notifySystem: member.notifySystem,
  };
}
