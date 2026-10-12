import { NextResponse } from "next/server";
import {
  AuthError,
  handleRouteError,
  publicAdmin,
  requireAdmin,
} from "@/src/lib/auth";
import { makeInitials, updateTeamMember } from "@/src/lib/store";
import type { TeamMember } from "@/src/lib/types";

export async function PATCH(request: Request) {
  try {
    const member = await requireAdmin();
    const body = await request.json();
    const patch: Partial<TeamMember> = {};

    if (body.name !== undefined) {
      const name = String(body.name || "").trim();
      if (!name) throw new AuthError(400, "Name is required.");
      patch.name = name;
      patch.initials = makeInitials(name);
    }
    if (typeof body.notifyClient === "boolean") {
      patch.notifyClient = body.notifyClient;
    }
    if (typeof body.notifyPayment === "boolean") {
      patch.notifyPayment = body.notifyPayment;
    }
    if (typeof body.notifyService === "boolean") {
      patch.notifyService = body.notifyService;
    }
    if (typeof body.notifyTeam === "boolean") {
      patch.notifyTeam = body.notifyTeam;
    }
    if (typeof body.notifySystem === "boolean") {
      patch.notifySystem = body.notifySystem;
    }

    if (Object.keys(patch).length === 0) {
      throw new AuthError(400, "Nothing to update.");
    }

    const updated = await updateTeamMember(member.id, patch);
    return NextResponse.json({ admin: publicAdmin(updated!) });
  } catch (err) {
    return handleRouteError(err);
  }
}
