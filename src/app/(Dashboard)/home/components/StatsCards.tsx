"use client";

import { ArrowUpIcon } from "@/public/svg/svg";
import { formatNaira } from "@/src/lib/format";

interface StatCardProps {
  title: string;
  value: string | number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100">
      <p className="text-sm text-gray-400 mb-3">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 tracking-tight">
        {value}
      </p>
      <p className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
        <ArrowUpIcon size={14} className="shrink-0" />
        <span>20% vs last month</span>
      </p>
    </div>
  );
}

type Props = {
  stats?: {
    totalClients: number;
    totalServices: number;
    activeProjects: number;
    totalPayments: number;
  };
};

export default function StatsCards({ stats }: Props) {
  const cards: StatCardProps[] = [
    { title: "Total clients", value: stats?.totalClients ?? 0 },
    { title: "Total services", value: stats?.totalServices ?? 0 },
    { title: "Active projects", value: stats?.activeProjects ?? 0 },
    {
      title: "Total payments",
      value: formatNaira(stats?.totalPayments ?? 0),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-3">
      {cards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
