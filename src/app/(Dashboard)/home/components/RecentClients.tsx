"use client";

import Link from "next/link";
import type { Client } from "@/src/lib/types";

export default function RecentClients({ clients }: { clients: Client[] }) {
  return (
    <div className="bg-white p-7 sm:p-8 rounded-2xl border border-gray-100 w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium text-gray-900">Recent clients</h2>
        <Link
          href="/clients"
          className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          See more
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">No clients yet.</p>
      ) : (
        <div className="space-y-5">
          {clients.map((client) => (
            <div
              key={client.id}
              className="grid grid-cols-[1.5fr_1.5fr_1fr] items-center gap-4 py-1"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-orange-50 text-orange-400">
                  {client.initials}
                </div>
                <span className="text-sm text-gray-800 font-medium truncate">
                  {client.name}
                </span>
              </div>
              <div className="text-sm text-gray-500 truncate">
                {client.serviceType || "—"}
              </div>
              <div className="flex justify-end">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    client.status === "Ended"
                      ? "bg-green-50 text-green-600"
                      : "bg-yellow-50 text-yellow-600"
                  }`}
                >
                  {client.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
