import { NextResponse } from "next/server";
import {
  AuthError,
  createAuthUser,
  handleRouteError,
  publicAdmin,
  setAuthCookies,
  signInWithPassword,
  validatePassword,
} from "@/src/lib/auth";
import {
  createId,
  findTeamByInviteToken,
  formatDisplayDate,
  hasActiveAdmin,
  insertTeamMember,
  makeInitials,
  updateTeamMember,
} from "@/src/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const token = String(body.token || "").trim();

    if (!name || !password) {
      throw new AuthError(400, "Name and password are required.");
    }
    validatePassword(password);

    if (token) {
      const invite = await findTeamByInviteToken(token);
      const expired =
        invite?.inviteExpiresAt &&
        new Date(invite.inviteExpiresAt).getTime() < Date.now();
      if (!invite || expired || invite.status === "Ended") {
        throw new AuthError(400, "This invite link is invalid or has expired.");
      }

      const user = await createAuthUser({
        email: invite.email,
        password,
        name,
        role: invite.role,
      });

      const member = await updateTeamMember(invite.id, {
        name,
        initials: makeInitials(name),
        status: "Active",
        authUserId: user.id,
        inviteToken: "",
        inviteExpiresAt: "",
      });

      const tokens = await signInWithPassword(invite.email, password);
      await setAuthCookies(tokens, true);
      return NextResponse.json({ admin: publicAdmin(member!) });
    }

    if (await hasActiveAdmin()) {
      throw new AuthError(403, "Ask a Netan admin to invite you.");
    }
    if (!email) throw new AuthError(400, "Email is required.");

    const user = await createAuthUser({
      email,
      password,
      name,
      role: "Superadmin",
    });

    const now = new Date();
    const member = await insertTeamMember({
      id: createId(),
      name,
      initials: makeInitials(name),
      email,
      role: "Superadmin",
      joined: formatDisplayDate(now),
      status: "Active",
      authUserId: user.id,
      notifyClient: true,
      notifyPayment: true,
      notifyService: true,
      notifyTeam: true,
      notifySystem: false,
      createdAt: now.toISOString(),
    });

    const tokens = await signInWithPassword(email, password);
    await setAuthCookies(tokens, true);
    return NextResponse.json({ admin: publicAdmin(member) });
  } catch (err) {
    return handleRouteError(err);
  }
}
