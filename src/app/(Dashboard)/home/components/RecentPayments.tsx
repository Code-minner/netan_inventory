"use client";

import Link from "next/link";
import type { Payment } from "@/src/lib/types";

export default function RecentPayments({ payments }: { payments: Payment[] }) {
  return (
    <div className="bg-white p-7 sm:p-8 rounded-lg border border-gray-100 w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium text-gray-900">Recent payments</h2>
        <Link
          href="/payments"
          className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          See more
        </Link>
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">No payments yet.</p>
      ) : (
        <div className="space-y-5">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="grid grid-cols-[2fr_1.5fr_1fr] items-center gap-4 py-1"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 bg-orange-50 text-orange-400">
                  {payment.initials}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm text-gray-800 font-medium truncate">
                    {payment.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {payment.servicesCount}{" "}
                    {payment.servicesCount === 1 ? "service" : "services"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-800 font-medium">
                  {payment.paidAmount}
                </span>
                <span className="text-xs text-gray-400">{payment.paidDate}</span>
              </div>
              <div className="flex justify-end">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    payment.status === "Completed"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
