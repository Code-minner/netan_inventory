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
import { uploadClientFile } from "@/src/lib/storage";
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

const ALLOWED_IMAGE = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
const MAX_BYTES = 5 * 1024 * 1024;

async function readImageFile(form: FormData, key: string) {
  const file = form.get(key);
  if (!file || typeof file === "string") return null;
  if (!ALLOWED_IMAGE.has(file.type)) {
    throw new Error("Uploads must be PNG or JPG (max 5MB).");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Each upload must be 5MB or smaller.");
  }
  return file;
}

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

    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const phone = String(form.get("phone") || "").trim();
    const timeline = String(form.get("timeline") || "").trim();
    const aboutProject = String(form.get("aboutProject") || "").trim();
    const paymentPercent = Number(form.get("paymentPercent")) as PaymentPercent;
    let serviceIds: string[] = [];
    try {
      serviceIds = JSON.parse(String(form.get("serviceIds") || "[]"));
    } catch {
      serviceIds = [];
    }

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

    const selectedServices = getServicesByIds(serviceIds);
    if (selectedServices.length === 0) {
      return NextResponse.json(
        { error: "Select at least one valid service." },
        { status: 400 },
      );
    }

    const projectDoc = await readImageFile(form, "projectDocument");
    const paymentProof = await readImageFile(form, "paymentProof");
    if (!paymentProof) {
      return NextResponse.json(
        { error: "Upload proof of payment before continuing." },
        { status: 400 },
      );
    }

    const orderTotal = sumServicePrices(selectedServices);
    const payNow = amountForPercent(orderTotal, paymentPercent);
    const folder = `forms/${current.id}`;

    let projectDocumentUrl = current.projectDocumentUrl || "";
    if (projectDoc) {
      projectDocumentUrl = await uploadClientFile(
        folder,
        projectDoc.name || "project.png",
        await projectDoc.arrayBuffer(),
        projectDoc.type,
      );
    }

    const paymentProofUrl = await uploadClientFile(
      folder,
      paymentProof.name || "payment-proof.png",
      await paymentProof.arrayBuffer(),
      paymentProof.type,
    );

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
      projectDocumentUrl,
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
