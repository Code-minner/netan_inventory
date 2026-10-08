"use client";

import React from "react";

const payments = [
  { id: 1, initials: "TK", name: "Tolu & Kene Studio", service: "UI/UX Design", amount: "₦1,200,000", date: "Mar 6, 2023", status: "Completed", color: "bg-red-50 text-red-700" },
  { id: 2, initials: "TK", name: "Tolu & Kene Studio", service: "UI/UX Design", amount: "₦1,200,000", date: "Mar 6, 2023", status: "Completed", color: "bg-red-50 text-red-700" },
  { id: 3, initials: "TK", name: "Tolu & Kene Studio", service: "UI/UX Design", amount: "₦1,200,000", date: "Mar 6, 2023", status: "Not completed", color: "bg-red-50 text-red-700" },
  { id: 4, initials: "PH", name: "Pinnacle Health", service: "Design & Branding", amount: "₦700,000", date: "Mar 6, 2023", status: "Completed", color: "bg-purple-50 text-purple-700" },
  { id: 5, initials: "PH", name: "Pinnacle Health", service: "Design & Branding", amount: "₦700,000", date: "Mar 6, 2023", status: "Completed", color: "bg-purple-50 text-purple-700" },
];

export default function RecentPayments() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Recent payments</h2>
        <button className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors">
          See more
        </button>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="grid grid-cols-[2fr_1.5fr_1fr] items-center gap-4">
            {/* Client Info */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${payment.color}`}>
                {payment.initials}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm text-gray-800 font-medium truncate">{payment.name}</span>
                <span className="text-xs text-gray-400">{payment.service}</span>
              </div>
            </div>

            {/* Amount & Date */}
            <div className="flex flex-col">
              <span className="text-sm text-gray-800 font-medium">{payment.amount}</span>
              <span className="text-xs text-gray-400">{payment.date}</span>
            </div>

            {/* Status Badge */}
            <div className="flex justify-end">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                payment.status === "Completed" 
                  ? "bg-green-50 text-green-600" 
                  : "bg-red-50 text-red-500"
              }`}>
                {payment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}