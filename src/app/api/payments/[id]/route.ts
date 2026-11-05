import { NextResponse } from "next/server";
import { handleRouteError, requireAdmin } from "@/src/lib/auth";
import { getClientById, getPaymentById } from "@/src/lib/store";

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
