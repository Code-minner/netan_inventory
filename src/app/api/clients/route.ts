import { NextResponse } from "next/server";
import { clientFormEmailHtml, sendEmail } from "@/src/lib/mail";
import { handleRouteError, requireAdmin, requireWriter } from "@/src/lib/auth";
import {
  createId,
  createToken,
  formatDisplayDate,
  formatNotificationTime,
  insertClient,
  insertNotification,
  listClients,
  makeInitials,
} from "@/src/lib/store";
import type { Client } from "@/src/lib/types";

export async function GET() {
  try {
    await requireAdmin();
    const clients = await listClients();
    return NextResponse.json({ clients });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireWriter();
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const servicesCount = Number(body.servicesCount) || 1;
    const duration = String(body.duration || "1 Month");
    const status = (body.status === "Ended" ? "Ended" : "Ongoing") as
      | "Ended"
      | "Ongoing";

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required." },
        { status: 400 },
      );
    }

    const now = new Date();
    const formToken = createToken();
    const client: Client = {
      id: createId(),
      name,
      email,
      phone,
      initials: makeInitials(name),
      servicesCount,
      duration,
      date: formatDisplayDate(now),
      status,
      formToken,
      formStatus: "pending",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const saved = await insertClient(client);

    const stamp = formatNotificationTime(now);
    await insertNotification({
      id: createId(),
      text: `A new client, ${name}, was added.`,
      time: stamp.time,
      unread: true,
      dateGroup: stamp.dateGroup,
      createdAt: now.toISOString(),
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const formUrl = `${frontendUrl}/client-form/${formToken}`;

    let emailSent = true;
    let emailError: string | undefined;
    try {
      await sendEmail({
        to: email,
        toName: name,
        subject: "Complete your Netan client form",
        html: clientFormEmailHtml({ clientName: name, formUrl }),
      });
    } catch (err) {
      emailSent = false;
      emailError = err instanceof Error ? err.message : "Failed to send email";
    }

    return NextResponse.json({
      client: saved,
      formUrl,
      emailSent,
      emailError,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
