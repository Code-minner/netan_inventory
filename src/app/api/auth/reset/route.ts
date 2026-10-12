import { NextResponse } from "next/server";
import {
  AuthError,
  handleRouteError,
  updateAuthPassword,
  validatePassword,
} from "@/src/lib/auth";
import { findTeamByResetToken, updateTeamMember } from "@/src/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token || "").trim();
    const password = String(body.password || "");
    if (!token) throw new AuthError(400, "Reset link is missing.");
    validatePassword(password);

    const member = await findTeamByResetToken(token);
    const expired =
      member?.resetExpiresAt &&
      new Date(member.resetExpiresAt).getTime() < Date.now();
    if (!member || expired || !member.authUserId) {
      throw new AuthError(400, "This reset link is invalid or has expired.");
    }

    await updateAuthPassword(member.authUserId, password);
    await updateTeamMember(member.id, {
      resetToken: "",
      resetExpiresAt: "",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
