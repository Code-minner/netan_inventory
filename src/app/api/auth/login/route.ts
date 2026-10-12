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
    if (!member) {
      throw new AuthError(
        401,
        "This email is not in the team table. Run the admin insert SQL on this Supabase project.",
      );
    }
    if (member.status !== "Active") {
      throw new AuthError(401, "This staff account is not active.");
    }
    if (!member.authUserId) {
      throw new AuthError(
        401,
        "This team row is not linked to Authentication. Re-run the insert that copies auth.users.id into team.auth_user_id.",
      );
    }

    let tokens;
    try {
      tokens = await signInWithPassword(email, password);
    } catch {
      throw new AuthError(
        401,
        "Wrong password for this Auth user. Use the password you set in Authentication → Users, or reset it there.",
      );
    }

    await setAuthCookies(tokens, persist);
    return NextResponse.json({ admin: publicAdmin(member) });
  } catch (err) {
    return handleRouteError(err);
  }
}
