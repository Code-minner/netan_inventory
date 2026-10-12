import { NextResponse } from "next/server";
import { handleRouteError, requireAdmin } from "@/src/lib/auth";
import { listClients } from "@/src/lib/store";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export async function GET() {
  try {
    await requireAdmin();
    const clients = await listClients();
    const now = new Date();
    const year = now.getFullYear();
    const thisMonth = now.getMonth();
    const lastMonthDate = new Date(year, thisMonth - 1, 1);

    const createdThisMonth = clients.filter((client) => {
      const created = new Date(client.createdAt);
      return (
        created.getFullYear() === year && created.getMonth() === thisMonth
      );
    }).length;
    const createdLastMonth = clients.filter((client) => {
      const created = new Date(client.createdAt);
      return (
        created.getFullYear() === lastMonthDate.getFullYear() &&
        created.getMonth() === lastMonthDate.getMonth()
      );
    }).length;

    const ongoing = clients.filter((client) => client.status === "Ongoing")
      .length;
    const ended = clients.length - ongoing;
    const change =
      createdLastMonth === 0
        ? createdThisMonth > 0
          ? 100
          : 0
        : Math.round(
            ((createdThisMonth - createdLastMonth) / createdLastMonth) * 100,
          );

    const growth = MONTHS.map((month, index) => ({
      month,
      clients: clients.filter((client) => {
        const created = new Date(client.createdAt);
        return created.getFullYear() === year && created.getMonth() === index;
      }).length,
    }));

    return NextResponse.json({
      year,
      stats: {
        totalClients: clients.length,
        newClients: createdThisMonth,
        activeClients: ongoing,
        inactiveClients: ended,
        change,
      },
      growth,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
