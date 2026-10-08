"use client";

import React from "react";

const clients = [
  { id: 1, initials: "TK", name: "Tolu & Kene Studio", service: "Design & Branding", status: "Ended", color: "bg-red-50 text-red-700" },
  { id: 2, initials: "iS", name: "iDesign Space", service: "Cloud Services & Solutions", status: "Ongoing", color: "bg-yellow-50 text-yellow-700" },
  { id: 3, initials: "iS", name: "iDesign Space", service: "Cloud Services & Solutions", status: "Ongoing", color: "bg-yellow-50 text-yellow-700" },
  { id: 4, initials: "PH", name: "Pinnacle Health", service: "UI/UX Design", status: "Ended", color: "bg-purple-50 text-purple-700" },
  { id: 5, initials: "PH", name: "Pinnacle Health", service: "UI/UX Design", status: "Ended", color: "bg-purple-50 text-purple-700" },
];

export default function RecentClients() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Recent clients</h2>
        <button className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors">
          See more
        </button>
      </div>

      <div className="space-y-4">
        {clients.map((client) => (
          <div key={client.id} className="grid grid-cols-[1.5fr_1.5fr_1fr] items-center gap-4">
            {/* Client Info */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${client.color}`}>
                {client.initials}
              </div>
              <span className="text-sm text-gray-800 font-medium truncate">{client.name}</span>
            </div>

            {/* Service */}
            <div className="text-sm text-gray-500 truncate">
              {client.service}
            </div>

            {/* Status Badge */}
            <div className="flex justify-end">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                client.status === "Ended" 
                  ? "bg-green-50 text-green-600" 
                  : "bg-yellow-50 text-yellow-600"
              }`}>
                {client.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}