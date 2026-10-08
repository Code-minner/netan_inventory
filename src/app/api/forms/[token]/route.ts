import { NextResponse } from "next/server";
import {
  formatNotificationTime,
  createId,
  readStore,
  writeStore,
} from "@/src/lib/store";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const store = await readStore();
  const client = store.clients.find((c) => c.formToken === token);

  if (!client) {
    return NextResponse.json({ error: "Form link is invalid." }, { status: 404 });
  }

  return NextResponse.json({
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      formStatus: client.formStatus,
      company: client.company || "",
      serviceType: client.serviceType || "",
      duration: client.duration,
      notes: client.notes || "",
      servicesCount: client.servicesCount,
    },
  });
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { token } = await params;
    const body = await request.json();
    const store = await readStore();
    const index = store.clients.findIndex((c) => c.formToken === token);

    if (index < 0) {
      return NextResponse.json(
        { error: "Form link is invalid." },
        { status: 404 },
      );
    }

    const current = store.clients[index];
    if (current.formStatus === "completed") {
      return NextResponse.json(
        { error: "This form has already been submitted." },
        { status: 400 },
      );
    }

    const company = String(body.company || "").trim();
    const serviceType = String(body.serviceType || "").trim();
    const duration = String(body.duration || current.duration).trim();
    const notes = String(body.notes || "").trim();
    const servicesCount = Number(body.servicesCount) || current.servicesCount;

    if (!company || !serviceType) {
      return NextResponse.json(
        { error: "Company and service type are required." },
        { status: 400 },
      );
    }

    const now = new Date();
    store.clients[index] = {
      ...current,
      name: company || current.name,
      company,
      serviceType,
      duration,
      notes,
      servicesCount,
      formStatus: "completed",
      status: "Ongoing",
      updatedAt: now.toISOString(),
    };

    const stamp = formatNotificationTime(now);
    store.notifications.unshift({
      id: createId(),
      text: `${company} completed their client form.`,
      time: stamp.time,
      unread: true,
      dateGroup: stamp.dateGroup,
      createdAt: now.toISOString(),
    });

    await writeStore(store);

    return NextResponse.json({
      ok: true,
      client: store.clients[index],
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to submit form",
      },
      { status: 500 },
    );
  }
}
