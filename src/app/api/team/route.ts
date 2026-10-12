import { NextResponse } from "next/server";
import { inviteMemberEmailHtml, sendEmail } from "@/src/lib/mail";
import {
  AuthError,
  handleRouteError,
  requireAdmin,
  requireWriter,
} from "@/src/lib/auth";
import { canInviteRole, canManageTeam, isValidRole } from "@/src/lib/roles";
import {
  createId,
  findTeamByEmail,
  formatDisplayDate,
  formatNotificationTime,
  insertNotification,
  insertTeamMember,
  listTeam,
  makeInitials,
  updateTeamMember,
} from "@/src/lib/store";
import type { TeamMember } from "@/src/lib/types";

export async function GET() {
  try {
    await requireAdmin();
    const team = await listTeam();
    return NextResponse.json({ team });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireWriter();
    if (!canManageTeam(actor.role)) {
      throw new AuthError(403, "You don't have permission to invite members.");
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const role = String(body.role || "Admin").trim();

    if (!name || !email) {
      throw new AuthError(400, "Name and email are required.");
    }
    if (!isValidRole(role)) {
      throw new AuthError(400, "Choose Superadmin, Admin, or Viewer.");
    }
    if (!canInviteRole(actor.role, role)) {
      throw new AuthError(403, "You can't assign that role.");
    }

    const existing = await findTeamByEmail(email);
    if (existing && existing.status === "Active") {
      throw new AuthError(400, "A member with this email already exists.");
    }

    const now = new Date();
    const inviteToken = `inv_${createId()}`;
    const inviteExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    let member: TeamMember;
    if (existing) {
      member = (await updateTeamMember(existing.id, {
        name,
        initials: makeInitials(name),
        role,
        status: "Invited",
        inviteToken,
        inviteExpiresAt,
      })) as TeamMember;
    } else {
      member = await insertTeamMember({
        id: createId(),
        name,
        initials: makeInitials(name),
        email,
        role,
        joined: formatDisplayDate(now),
        status: "Invited",
        inviteToken,
        inviteExpiresAt,
        notifyClient: true,
        notifyPayment: true,
        notifyService: true,
        notifyTeam: true,
        notifySystem: false,
        createdAt: now.toISOString(),
      });
    }

    const stamp = formatNotificationTime(now);
    await insertNotification({
      id: createId(),
      text: `${actor.name} invited ${name} to the workspace.`,
      time: stamp.time,
      unread: true,
      dateGroup: stamp.dateGroup,
      createdAt: now.toISOString(),
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const inviteUrl = `${frontendUrl}/register?token=${encodeURIComponent(inviteToken)}`;

    let emailSent = true;
    let emailError: string | undefined;
    try {
      await sendEmail({
        to: email,
        toName: name,
        subject: "You're invited to Netan",
        html: inviteMemberEmailHtml({ name, role, inviteUrl }),
      });
    } catch (err) {
      emailSent = false;
      emailError = err instanceof Error ? err.message : "Failed to send email";
    }

    return NextResponse.json({
      member,
      emailSent,
      emailError,
      inviteUrl,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
