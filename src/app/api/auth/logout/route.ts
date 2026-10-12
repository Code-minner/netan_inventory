import { NextResponse } from "next/server";
import { clearAuthCookies, handleRouteError } from "@/src/lib/auth";

export async function POST() {
  try {
    await clearAuthCookies();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
