import { NextResponse } from "next/server";
import { inviteMemberEmailHtml, sendEmail } from "@/src/lib/mail";
import {
  createId,
  formatDisplayDate,
  formatNotificationTime,
  makeInitials,
  readStore,
  writeStore,
} from "@/src/lib/store";
import type { TeamMember } from "@/src/lib/types";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ team: store.team });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const role = String(body.role || "Admin").trim();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }

    const store = await readStore();
    if (store.team.some((m) => m.email === email)) {
      return NextResponse.json(
        { error: "A member with this email already exists." },
        { status: 400 },
      );
    }

    const now = new Date();
    const member: TeamMember = {
      id: createId(),
      name,
      initials: makeInitials(name),
      email,
      role,
      joined: formatDisplayDate(now),
      status: "Invited",
      createdAt: now.toISOString(),
    };

    store.team.unshift(member);

    const stamp = formatNotificationTime(now);
    store.notifications.unshift({
      id: createId(),
      text: `Admin invited ${name} to the workspace.`,
      time: stamp.time,
      unread: true,
      dateGroup: stamp.dateGroup,
      createdAt: now.toISOString(),
    });

    await writeStore(store);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const inviteUrl = `${frontendUrl}/register?email=${encodeURIComponent(email)}`;

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

    return NextResponse.json({ member, emailSent, emailError, inviteUrl });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to invite member",
      },
      { status: 500 },
    );
  }
}
