import { NextResponse } from "next/server";
import {
  handleRouteError,
  publicAdmin,
  requireAdmin,
} from "@/src/lib/auth";

export async function GET() {
  try {
    const member = await requireAdmin();
    return NextResponse.json({ admin: publicAdmin(member) });
  } catch (err) {
    return handleRouteError(err);
  }
}
