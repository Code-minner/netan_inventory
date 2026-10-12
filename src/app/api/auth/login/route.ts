import { NextResponse } from "next/server";
import {
  AuthError,
  handleRouteError,
  publicAdmin,
  setAuthCookies,
  signInWithPassword,
} from "@/src/lib/auth";
import { findTeamByEmail } from "@/src/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const persist = Boolean(body.staySignedIn);

    if (!email || !password) {
      throw new AuthError(400, "Email and password are required.");
    }

    const member = await findTeamByEmail(email);
    if (!member || member.status !== "Active" || !member.authUserId) {
      throw new AuthError(401, "Invalid email or password.");
    }

    let tokens;
    try {
      tokens = await signInWithPassword(email, password);
    } catch {
      throw new AuthError(401, "Invalid email or password.");
    }

    await setAuthCookies(tokens, persist);
    return NextResponse.json({ admin: publicAdmin(member) });
  } catch (err) {
    return handleRouteError(err);
  }
}
