import { NextResponse } from "next/server";
import {
  clientFormEmailHtml,
  sendEmail,
} from "@/src/lib/mail";
import {
  createId,
  createToken,
  formatDisplayDate,
  formatNotificationTime,
  makeInitials,
  readStore,
  writeStore,
} from "@/src/lib/store";
import type { Client } from "@/src/lib/types";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ clients: store.clients });
}

export async function POST(request: Request) {
  try {
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

    const store = await readStore();
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

    store.clients.unshift(client);

    const stamp = formatNotificationTime(now);
    store.notifications.unshift({
      id: createId(),
      text: `A new client, ${name}, was added.`,
      time: stamp.time,
      unread: true,
      dateGroup: stamp.dateGroup,
      createdAt: now.toISOString(),
    });

    await writeStore(store);

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
      client,
      formUrl,
      emailSent,
      emailError,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create client" },
      { status: 500 },
    );
  }
}
