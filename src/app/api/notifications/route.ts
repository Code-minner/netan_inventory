import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/src/lib/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ notifications: store.notifications });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const store = await readStore();

  if (body.markAllRead) {
    store.notifications = store.notifications.map((n) => ({
      ...n,
      unread: false,
    }));
    await writeStore(store);
  }

  return NextResponse.json({ notifications: store.notifications });
}
