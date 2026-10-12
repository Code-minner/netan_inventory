import { NextResponse } from "next/server";
import { handleRouteError, requireAdmin } from "@/src/lib/auth";
import {
  listNotifications,
  markAllNotificationsRead,
} from "@/src/lib/store";

export async function GET() {
  try {
    await requireAdmin();
    const notifications = await listNotifications();
    return NextResponse.json({ notifications });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const notifications = body.markAllRead
      ? await markAllNotificationsRead()
      : await listNotifications();
    return NextResponse.json({ notifications });
  } catch (err) {
    return handleRouteError(err);
  }
}
