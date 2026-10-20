import { NextResponse } from "next/server";
import {
  createId,
  formatNotificationTime,
  getClientByToken,
  insertNotification,
  updateClient,
} from "@/src/lib/store";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { token } = await params;
    const client = await getClientByToken(token);

    if (!client) {
      return NextResponse.json(
        { error: "Form link is invalid." },
        { status: 404 },
      );
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
        projectName: client.projectName || "",
        projectDescription: client.projectDescription || "",
        budget: client.budget || "",
        goals: client.goals || "",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load form" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { token } = await params;
    const body = await request.json();
    const current = await getClientByToken(token);

    if (!current) {
      return NextResponse.json(
        { error: "Form link is invalid." },
        { status: 404 },
      );
    }

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
    const projectName = String(body.projectName || "").trim();
    const projectDescription = String(body.projectDescription || "").trim();
    const budget = String(body.budget || "").trim();
    const goals = String(body.goals || "").trim();

    if (!company || !serviceType || !projectName || !projectDescription) {
      return NextResponse.json(
        {
          error:
            "Company, service type, project name, and project description are required.",
        },
        { status: 400 },
      );
    }

    const now = new Date();
    const client = await updateClient(current.id, {
      company,
      serviceType,
      duration,
      notes,
      servicesCount,
      projectName,
      projectDescription,
      budget,
      goals,
      formStatus: "completed",
      status: "Ongoing",
    });

    const stamp = formatNotificationTime(now);
    await insertNotification({
      id: createId(),
      text: `${company} completed their client form.`,
      time: stamp.time,
      unread: true,
      dateGroup: stamp.dateGroup,
      createdAt: now.toISOString(),
    });

    return NextResponse.json({ ok: true, client });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to submit form",
      },
      { status: 500 },
    );
  }
}
