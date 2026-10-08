import { NextResponse } from "next/server";
import {
  createId,
  formatDisplayDate,
  formatNotificationTime,
  makeInitials,
  readStore,
  writeStore,
} from "@/src/lib/store";
import type { Payment } from "@/src/lib/types";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ payments: store.payments });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const amount = String(body.amount || "").trim();
    const paidAmount = String(body.paidAmount || "").trim();
    const servicesCount = Number(body.servicesCount) || 1;
    const status = (
      body.status === "Not Completed" ? "Not Completed" : "Completed"
    ) as Payment["status"];
    const clientId = body.clientId ? String(body.clientId) : undefined;

    if (!name || !amount || !paidAmount) {
      return NextResponse.json(
        { error: "Client, amount, and paid amount are required." },
        { status: 400 },
      );
    }

    const store = await readStore();
    const now = new Date();
    const payment: Payment = {
      id: createId(),
      clientId,
      name,
      initials: makeInitials(name),
      servicesCount,
      amount,
      paidAmount,
      paidDate: formatDisplayDate(now),
      status,
      createdAt: now.toISOString(),
    };

    store.payments.unshift(payment);

    const stamp = formatNotificationTime(now);
    store.notifications.unshift({
      id: createId(),
      text: `A payment of ${paidAmount} was recorded for ${name}.`,
      time: stamp.time,
      unread: true,
      dateGroup: stamp.dateGroup,
      createdAt: now.toISOString(),
    });

    await writeStore(store);
    return NextResponse.json({ payment });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to create payment",
      },
      { status: 500 },
    );
  }
}
