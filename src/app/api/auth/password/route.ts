import { NextResponse } from "next/server";
import {
  AuthError,
  handleRouteError,
  requireAdmin,
  signInWithPassword,
  updateAuthPassword,
  validatePassword,
} from "@/src/lib/auth";

export async function POST(request: Request) {
  try {
    const member = await requireAdmin();
    const body = await request.json();
    const oldPassword = String(body.oldPassword || "");
    const newPassword = String(body.newPassword || "");
    if (!oldPassword) throw new AuthError(400, "Current password is required.");
    validatePassword(newPassword);

    try {
      await signInWithPassword(member.email, oldPassword);
    } catch {
      throw new AuthError(400, "Current password is incorrect.");
    }

    if (!member.authUserId) {
      throw new AuthError(400, "This account cannot change password yet.");
    }

    await updateAuthPassword(member.authUserId, newPassword);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
