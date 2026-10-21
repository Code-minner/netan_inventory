import { NextResponse } from "next/server";
import { BANK_DETAILS } from "@/src/lib/bank-details";
import { formatNaira } from "@/src/lib/format";
import {
  amountForPercent,
  getServicesByIds,
  sumServicePrices,
  type PaymentPercent,
  SERVICE_CATALOG,
} from "@/src/lib/services-catalog";
import { isAllowedClientUploadUrl } from "@/src/lib/storage";
import {
  createId,
  formatDisplayDate,
  formatNotificationTime,
  getClientByToken,
  insertNotification,
  insertPayment,
  makeInitials,
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
        aboutProject: client.aboutProject || client.notes || "",
        timeline: client.timeline || "",
        selectedServices: client.selectedServices || [],
        paymentPercent: client.paymentPercent || 100,
        orderTotal: client.orderTotal || "",
      },
      catalog: SERVICE_CATALOG,
      bank: BANK_DETAILS,
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

    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const timeline = String(body.timeline || "").trim();
    const aboutProject = String(body.aboutProject || "").trim();
    const paymentPercent = Number(body.paymentPercent) as PaymentPercent;
    const serviceIds = Array.isArray(body.serviceIds) ? body.serviceIds : [];
    const projectDocumentUrl = String(body.projectDocumentUrl || "").trim();
    const paymentProofUrl = String(body.paymentProofUrl || "").trim();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Client name, email, and phone are required." },
        { status: 400 },
      );
    }
    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { error: "Select at least one service." },
        { status: 400 },
      );
    }
    if (!timeline) {
      return NextResponse.json(
        { error: "Choose a project timeline date." },
        { status: 400 },
      );
    }
    if (![50, 80, 100].includes(paymentPercent)) {
      return NextResponse.json(
        { error: "Choose a payment option of 50%, 80%, or 100%." },
        { status: 400 },
      );
    }
    if (aboutProject.length > 1000) {
      return NextResponse.json(
        { error: "About text must be 1000 characters or fewer." },
        { status: 400 },
      );
    }
    if (!paymentProofUrl || !isAllowedClientUploadUrl(paymentProofUrl)) {
      return NextResponse.json(
        { error: "Upload proof of payment before continuing." },
        { status: 400 },
      );
    }
    if (
      projectDocumentUrl &&
      !isAllowedClientUploadUrl(projectDocumentUrl)
    ) {
      return NextResponse.json(
        { error: "Project document upload is invalid. Try uploading again." },
        { status: 400 },
      );
    }

    const selectedServices = getServicesByIds(
      serviceIds.map((id: unknown) => String(id)),
    );
    if (selectedServices.length === 0) {
      return NextResponse.json(
        { error: "Select at least one valid service." },
        { status: 400 },
      );
    }

    const orderTotal = sumServicePrices(selectedServices);
    const payNow = amountForPercent(orderTotal, paymentPercent);
    const now = new Date();
    const serviceType = selectedServices.map((s) => s.title).join(", ");

    const client = await updateClient(current.id, {
      name,
      email,
      phone,
      initials: makeInitials(name),
      company: name,
      serviceType,
      servicesCount: selectedServices.length,
      duration: timeline,
      timeline,
      notes: aboutProject,
      aboutProject,
      projectDescription: aboutProject,
      selectedServices,
      projectDocumentUrl: projectDocumentUrl || current.projectDocumentUrl || "",
      paymentPercent,
      paymentProofUrl,
      orderTotal: formatNaira(orderTotal),
      budget: formatNaira(orderTotal),
      formStatus: "completed",
      status: "Ongoing",
    });

    await insertPayment({
      id: createId(),
      clientId: current.id,
      name,
      initials: makeInitials(name),
      servicesCount: selectedServices.length,
      amount: formatNaira(orderTotal),
      paidAmount: formatNaira(payNow),
      paidDate: formatDisplayDate(now),
      status: "Not Completed",
      paymentPercent,
      paymentProofUrl,
      createdAt: now.toISOString(),
    });

    const stamp = formatNotificationTime(now);
    await insertNotification({
      id: createId(),
      text: `${name} submitted onboarding and payment proof (${paymentPercent}%).`,
      time: stamp.time,
      unread: true,
      dateGroup: stamp.dateGroup,
      createdAt: now.toISOString(),
    });

    return NextResponse.json({
      ok: true,
      client,
      payment: {
        amount: formatNaira(payNow),
        percent: paymentPercent,
        total: formatNaira(orderTotal),
      },
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
