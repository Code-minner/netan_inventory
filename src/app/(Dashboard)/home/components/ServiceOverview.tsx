"use client";

import React from "react";

const services = [
  { 
    id: 1, 
    title: "Design & Branding", 
    count: 15,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
        <path d="M7 8h10"></path>
        <path d="M7 12h6"></path>
      </svg>
    )
  },
  { 
    id: 2, 
    title: "UI/UX Design", 
    count: 13,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    )
  },
  { 
    id: 3, 
    title: "Web Development", 
    count: 11,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
        <line x1="14" y1="4" x2="10" y2="20"></line>
      </svg>
    )
  },
];

export default function ServiceOverview() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 w-full">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Service Overview</h2>
      
      <div className="grid grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between aspect-square">
            <div className="text-gray-800">
              {service.icon}
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">{service.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{service.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}