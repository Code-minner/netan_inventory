import { NextResponse } from "next/server";
import { resetPasswordEmailHtml, sendEmail } from "@/src/lib/mail";
import { AuthError, handleRouteError } from "@/src/lib/auth";
import {
  createId,
  findTeamByEmail,
  updateTeamMember,
} from "@/src/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) throw new AuthError(400, "Email is required.");

    const member = await findTeamByEmail(email);
    if (member?.status === "Active" && member.authUserId) {
      const resetToken = `rst_${createId()}`;
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await updateTeamMember(member.id, {
        resetToken,
        resetExpiresAt: expires,
      });

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetUrl = `${frontendUrl}/set-password?token=${resetToken}`;
      try {
        await sendEmail({
          to: member.email,
          toName: member.name,
          subject: "Reset your Netan password",
          html: resetPasswordEmailHtml({ name: member.name, resetUrl }),
        });
      } catch {
        // Still return OK so this endpoint cannot be used to probe emails.
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
