import { NextResponse } from "next/server";
import { handleRouteError, requireAdmin } from "@/src/lib/auth";
import { parseAmount } from "@/src/lib/format";
import {
  listClients,
  listNotifications,
  listPayments,
} from "@/src/lib/store";

export async function GET() {
  try {
    await requireAdmin();
    const [clients, payments, notifications] = await Promise.all([
      listClients(),
      listPayments(),
      listNotifications(),
    ]);

    const totalServices = clients.reduce(
      (sum, client) => sum + (client.servicesCount || 0),
      0,
    );
    const activeProjects = clients.filter(
      (client) => client.status === "Ongoing",
    ).length;
    const totalPayments = payments.reduce(
      (sum, payment) => sum + parseAmount(payment.paidAmount),
      0,
    );

    const serviceCounts = new Map<string, number>();
    for (const client of clients) {
      const key = client.serviceType || "Unspecified";
      serviceCounts.set(key, (serviceCounts.get(key) || 0) + 1);
    }

    return NextResponse.json({
      stats: {
        totalClients: clients.length,
        totalServices,
        activeProjects,
        totalPayments,
      },
      recentClients: clients.slice(0, 5),
      recentPayments: payments.slice(0, 5),
      recentActivities: notifications.slice(0, 6),
      services: [...serviceCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([title, count]) => ({ title, count })),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
