import { NextResponse } from "next/server";
import { handleRouteError } from "@/src/lib/auth";
import { findTeamByInviteToken, hasActiveAdmin } from "@/src/lib/store";

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") || "";

    if (token) {
      const invite = await findTeamByInviteToken(token);
      const expired =
        invite?.inviteExpiresAt &&
        new Date(invite.inviteExpiresAt).getTime() < Date.now();
      if (!invite || invite.status === "Ended" || expired) {
        return NextResponse.json({
          mode: "invalid",
          error: "This invite link is invalid or has expired.",
        });
      }
      if (invite.status === "Active" && invite.authUserId) {
        return NextResponse.json({
          mode: "invalid",
          error: "This invite has already been accepted. Sign in instead.",
        });
      }
      return NextResponse.json({
        mode: "invite",
        name: invite.name,
        email: invite.email,
        role: invite.role,
      });
    }

    if (await hasActiveAdmin()) {
      return NextResponse.json({
        mode: "closed",
        error: "Ask a Netan admin to invite you.",
      });
    }

    return NextResponse.json({ mode: "first" });
  } catch (err) {
    return handleRouteError(err);
  }
}
