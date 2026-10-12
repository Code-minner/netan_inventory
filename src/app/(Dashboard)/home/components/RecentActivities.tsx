"use client";

import type { NotificationItem } from "@/src/lib/types";

export default function RecentActivities({
  items,
}: {
  items: NotificationItem[];
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 w-full">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Recent Activities</h2>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          No activity yet.
        </p>
      ) : (
        <div className="space-y-6">
          {items.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-800 leading-snug mb-1">
                  {activity.text}
                </p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
