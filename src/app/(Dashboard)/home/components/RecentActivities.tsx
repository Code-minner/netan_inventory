"use client";

import { CustomersIcon, PaymentsIcon } from "@/public/svg/svg";
import type { NotificationItem } from "@/src/lib/types";

function activityIcon(text: string) {
  const lower = text.toLowerCase();
  if (
    lower.includes("payment") ||
    lower.includes("paid") ||
    lower.includes("milestone")
  ) {
    return PaymentsIcon;
  }
  return CustomersIcon;
}

export default function RecentActivities({
  items,
}: {
  items: NotificationItem[];
}) {
  return (
    <div className="bg-white p-7 sm:p-8 rounded-xl border border-gray-100 w-full">
      <h2 className="text-lg font-medium text-gray-900 mb-8">
        Recent Activities
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">
          No activity yet.
        </p>
      ) : (
        <div className="space-y-6">
          {items.map((activity) => {
            const Icon = activityIcon(activity.text);
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl border border-[#E8E6F2] bg-[#F6F5FB] flex items-center justify-center flex-shrink-0 text-[#2E2A5C]">
                  <Icon size={20} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm text-gray-800 leading-snug mb-1">
                    {activity.text}
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
