import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, requireAdmin } from "@/src/lib/auth";
import { parseAmount } from "@/src/lib/format";
import { listClients, listPayments } from "@/src/lib/store";

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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const yearParam = Number(request.nextUrl.searchParams.get("year"));
    const now = new Date();
    const year = Number.isFinite(yearParam) && yearParam > 2000
      ? yearParam
      : now.getFullYear();
    const thisMonth = now.getMonth();
    const lastMonthDate = new Date(now.getFullYear(), thisMonth - 1, 1);

    const [clients, payments] = await Promise.all([
      listClients(),
      listPayments(),
    ]);

    const totalRevenue = payments.reduce(
      (sum, payment) => sum + parseAmount(payment.paidAmount),
      0,
    );
    const outstandingAmount = payments.reduce((sum, payment) => {
      const due = parseAmount(payment.amount) - parseAmount(payment.paidAmount);
      return sum + Math.max(0, due);
    }, 0);

    const paidCount = payments.filter((p) => p.status === "Completed").length;
    const outstandingCount = payments.filter(
      (p) => p.status !== "Completed",
    ).length;

    const revenueThisMonth = payments
      .filter((payment) => {
        const created = new Date(payment.createdAt);
        return (
          created.getFullYear() === now.getFullYear() &&
          created.getMonth() === thisMonth
        );
      })
      .reduce((sum, payment) => sum + parseAmount(payment.paidAmount), 0);

    const revenueLastMonth = payments
      .filter((payment) => {
        const created = new Date(payment.createdAt);
        return (
          created.getFullYear() === lastMonthDate.getFullYear() &&
          created.getMonth() === lastMonthDate.getMonth()
        );
      })
      .reduce((sum, payment) => sum + parseAmount(payment.paidAmount), 0);

    const change =
      revenueLastMonth === 0
        ? revenueThisMonth > 0
          ? 100
          : 0
        : Math.round(
            ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
          );

    const revenue = MONTHS.map((month, index) => ({
      month,
      revenue: payments
        .filter((payment) => {
          const created = new Date(payment.createdAt);
          return (
            created.getFullYear() === year && created.getMonth() === index
          );
        })
        .reduce((sum, payment) => sum + parseAmount(payment.paidAmount), 0),
    }));

    const years = new Set<number>([year, now.getFullYear()]);
    for (const payment of payments) {
      const y = new Date(payment.createdAt).getFullYear();
      if (Number.isFinite(y)) years.add(y);
    }

    return NextResponse.json({
      year,
      years: [...years].sort((a, b) => b - a),
      stats: {
        totalRevenue,
        payments: payments.length,
        outstanding: outstandingAmount,
        clients: clients.length,
        change,
      },
      revenue,
      paymentStatus: {
        paid: paidCount,
        outstanding: outstandingCount,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
