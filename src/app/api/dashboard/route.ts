import { NextResponse } from "next/server";
import { handleRouteError, requireAdmin } from "@/src/lib/auth";
import { parseAmount } from "@/src/lib/format";
import { SERVICE_OVERVIEW_BUCKETS } from "@/src/lib/services-catalog";
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

    const bucketCounts = SERVICE_OVERVIEW_BUCKETS.map((bucket) => {
      const idSet = new Set<string>(bucket.catalogIds);
      let count = 0;
      for (const client of clients) {
        const selected = client.selectedServices || [];
        if (selected.length > 0) {
          count += selected.filter((service) => idSet.has(service.id)).length;
          continue;
        }
        const type = (client.serviceType || "").toLowerCase();
        if (!type) continue;
        if (
          bucket.title === "Design & Branding" &&
          (type.includes("brand") || type.includes("seo") || type.includes("marketing"))
        ) {
          count += 1;
        } else if (
          bucket.title === "UI/UX Design" &&
          (type.includes("ui") || type.includes("ux"))
        ) {
          count += 1;
        } else if (
          bucket.title === "Web Development" &&
          (type.includes("web") ||
            type.includes("website") ||
            type.includes("cloud") ||
            type.includes("mobile"))
        ) {
          count += 1;
        }
      }
      return { title: bucket.title, count };
    });

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
      services: bucketCounts,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
