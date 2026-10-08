"use client";

import React from "react";

const activities = [
  { id: 1, type: "payment", text: "Payment logged for Tolu & Kene Studio— Milestone 1", time: "1 day ago" },
  { id: 2, type: "client", text: "Pinnacle Health added as a new client", time: "1 day ago" },
  { id: 3, type: "payment", text: "Payment logged for Tolu & Kene Studio— Milestone 1", time: "1 day ago" },
  { id: 4, type: "client", text: "Pinnacle Health added as a new client", time: "1 day ago" },
  { id: 5, type: "payment", text: "Payment logged for Tolu & Kene Studio— Milestone 1", time: "1 day ago" },
];

export default function RecentActivities() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 w-full">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Recent Activities</h2>
      
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            {/* Icon Container */}
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
              {activity.type === "payment" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              )}
            </div>
            
            {/* Text Content */}
            <div>
              <p className="text-sm text-gray-800 leading-snug mb-1">{activity.text}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}