"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsCards from "./components/StatsCards";
import RecentActivities from "./components/RecentActivities";
import RecentClients from "./components/RecentClients";
import ServiceOverview from "./components/ServiceOverview";
import RecentPayments from "./components/RecentPayments";
import { useAuth } from "@/src/components/AuthProvider";
import { apiFetch } from "@/src/lib/api";
import type { Client, NotificationItem, Payment } from "@/src/lib/types";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type DashboardData = {
  stats: {
    totalClients: number;
    totalServices: number;
    activeProjects: number;
    totalPayments: number;
  };
  recentClients: Client[];
  recentPayments: Payment[];
  recentActivities: NotificationItem[];
  services: { title: string; count: number }[];
};

export default function HomePage() {
  const { admin } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const firstName =
    admin?.name?.trim().split(/\s+/)[0] ||
    admin?.email.split("@")[0] ||
    "there";
  const greeting = greetingForHour(new Date().getHours());

  useEffect(() => {
    apiFetch<DashboardData>("/api/dashboard")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div className="">
      <div className="space-y-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-500 leading-relaxed max-w-2xl">
          {greeting}. Here&apos;s a quick summary of how Netan is performing.
        </p>
      </div>

      <StatsCards stats={data?.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <RecentActivities items={data?.recentActivities || []} />
          <ServiceOverview services={data?.services || []} />
        </div>
        <div className="flex flex-col gap-2">
          <RecentClients clients={data?.recentClients || []} />
          <RecentPayments payments={data?.recentPayments || []} />
        </div>
      </div>

      <p className="text-xs text-gray-400 pt-2">
        Need the full lists?{" "}
        <Link href="/clients" className="text-[#2D266C] font-medium hover:underline">
          Clients
        </Link>{" "}
        and{" "}
        <Link href="/payments" className="text-[#2D266C] font-medium hover:underline">
          Payments
        </Link>
        .
      </p>
    </div>
  );
}
