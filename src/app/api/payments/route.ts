import { NextResponse } from "next/server";
import { handleRouteError, requireAdmin, requireWriter } from "@/src/lib/auth";
import {
  createId,
  formatDisplayDate,
  formatNotificationTime,
  insertNotification,
  insertPayment,
  listPayments,
  makeInitials,
} from "@/src/lib/store";
import type { Payment } from "@/src/lib/types";

export async function GET() {
  try {
    await requireAdmin();
    const payments = await listPayments();
    return NextResponse.json({ payments });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireWriter();
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

    const saved = await insertPayment(payment);

    const stamp = formatNotificationTime(now);
    await insertNotification({
      id: createId(),
      text: `A payment of ${paidAmount} was recorded for ${name}.`,
      time: stamp.time,
      unread: true,
      dateGroup: stamp.dateGroup,
      createdAt: now.toISOString(),
    });

    return NextResponse.json({ payment: saved });
  } catch (err) {
    return handleRouteError(err);
  }
}
