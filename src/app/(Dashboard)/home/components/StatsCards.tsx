"use client";

import { formatNaira } from "@/src/lib/format";

interface StatCardProps {
  title: string;
  value: string | number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100">
      <p className="text-sm text-gray-400 mb-3">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
