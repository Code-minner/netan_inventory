"use client";

import StatsCards from "./components/StatsCards";
import RecentActivities from "./components/RecentActivities";
import RecentClients from "./components/RecentClients";
import ServiceOverview from "./components/ServiceOverview";
import RecentPayments from "./components/RecentPayments";
import { CURRENT_ADMIN } from "@/src/lib/mock-data";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const firstName =
    CURRENT_ADMIN.name?.trim().split(/\s+/)[0] ||
    CURRENT_ADMIN.email.split("@")[0];
  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-500 leading-relaxed">
          {greeting}. Here&apos;s a quick summary of how Netan is performing.
        </p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <RecentActivities />
          <ServiceOverview />
        </div>
        <div className="flex flex-col gap-6">
          <RecentClients />
          <RecentPayments />
        </div>
      </div>
    </div>
  );
}