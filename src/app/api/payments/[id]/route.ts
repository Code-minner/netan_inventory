import { NextResponse } from "next/server";
import {
  AuthError,
  handleRouteError,
  requireAdmin,
  requireWriter,
} from "@/src/lib/auth";
import { normalizePaymentStatus } from "@/src/lib/payment-status";
import {
  createId,
  formatNotificationTime,
  getClientById,
  getPaymentById,
  insertNotification,
  updatePayment,
} from "@/src/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const payment = await getPaymentById(id);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const client = payment.clientId
      ? await getClientById(payment.clientId)
      : null;

    return NextResponse.json({ payment, client });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireWriter();
    const { id } = await params;
    const existing = await getPaymentById(id);
    if (!existing) {
      throw new AuthError(404, "Payment not found");
    }

    const body = await request.json();
    const nextStatus = body.status
      ? normalizePaymentStatus(String(body.status))
      : undefined;

    if (!nextStatus) {
      throw new AuthError(400, "Payment status is required.");
    }

    const payment = await updatePayment(id, { status: nextStatus });
    if (!payment) {
      throw new AuthError(404, "Payment not found");
    }

    if (
      nextStatus === "Completed" &&
      existing.status !== "Completed"
    ) {
      const now = new Date();
      const stamp = formatNotificationTime(now);
      await insertNotification({
        id: createId(),
        text: `Payment from ${payment.name} (${payment.paidAmount}) was confirmed.`,
        time: stamp.time,
        unread: true,
        dateGroup: stamp.dateGroup,
        createdAt: now.toISOString(),
      });
    }

    return NextResponse.json({ payment });
  } catch (err) {
    return handleRouteError(err);
  }
}
