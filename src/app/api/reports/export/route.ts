import { handleRouteError, requireAdmin } from "@/src/lib/auth";
import { listClients, listPayments } from "@/src/lib/store";

function csvEscape(value: string | number | undefined) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows: Array<Array<string | number | undefined>>) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function daysForRange(range: string) {
  if (range === "Last 7 days") return 7;
  if (range === "Last 90 days") return 90;
  if (range === "This year") return 366;
  return 30;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "Client Report";
    const range = url.searchParams.get("range") || "Last 30 days";
    const since = Date.now() - daysForRange(range) * 24 * 60 * 60 * 1000;

    let csv = "";
    let filename = "netan-report.csv";

    if (type === "Payment Report") {
      const payments = (await listPayments()).filter(
        (payment) => new Date(payment.createdAt).getTime() >= since,
      );
      csv = toCsv([
        ["Client", "Amount", "Paid", "Date", "Status", "Services"],
        ...payments.map((payment) => [
          payment.name,
          payment.amount,
          payment.paidAmount,
          payment.paidDate,
          payment.status,
          payment.servicesCount,
        ]),
      ]);
      filename = "netan-payments.csv";
    } else if (type === "Service Report") {
      const clients = (await listClients()).filter(
        (client) => new Date(client.createdAt).getTime() >= since,
      );
      csv = toCsv([
        ["Client", "Service type", "Services", "Duration", "Status", "Project"],
        ...clients.map((client) => [
          client.name,
          client.serviceType || "",
          client.servicesCount,
          client.duration,
          client.status,
          client.projectName || "",
        ]),
      ]);
      filename = "netan-services.csv";
    } else {
      const clients = (await listClients()).filter(
        (client) => new Date(client.createdAt).getTime() >= since,
      );
      csv = toCsv([
        [
          "Name",
          "Email",
          "Phone",
          "Status",
          "Form",
          "Service type",
          "Project",
          "Budget",
          "Date",
        ],
        ...clients.map((client) => [
          client.name,
          client.email,
          client.phone,
          client.status,
          client.formStatus,
          client.serviceType || "",
          client.projectName || "",
          client.budget || "",
          client.date,
        ]),
      ]);
      filename = "netan-clients.csv";
    }

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
