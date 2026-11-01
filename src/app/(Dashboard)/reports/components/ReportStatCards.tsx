"use client";

import { ArrowUpIcon, ArrowDownIcon } from "@/public/svg/svg";
import { formatNaira } from "@/src/lib/format";

type StatCardProps = {
  title: string;
  value: string;
  change: number;
};

function StatCard({ title, value, change }: StatCardProps) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
      <p className="text-sm text-gray-400 mb-3">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 tracking-tight">
        {value}
      </p>
      <p
        className={`mt-3 flex items-center gap-1 text-xs font-medium ${
          isPositive ? "text-emerald-600" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <ArrowUpIcon size={14} className="shrink-0" />
        ) : (
          <ArrowDownIcon size={14} className="shrink-0" />
        )}
        <span>
          {Math.abs(change)}% vs last month
        </span>
      </p>
    </div>
  );
}

type Props = {
  stats?: {
    totalRevenue: number;
    payments: number;
    outstanding: number;
    clients: number;
    change: number;
  };
};

export default function ReportStatCards({ stats }: Props) {
  const change = stats?.change ?? 0;
  const cards: StatCardProps[] = [
    {
      title: "Total Revenue",
      value: formatNaira(stats?.totalRevenue ?? 0),
      change,
    },
    {
      title: "Payments",
      value: String(stats?.payments ?? 0),
      change,
    },
    {
      title: "Outstanding",
      value: formatNaira(stats?.outstanding ?? 0),
      change,
    },
    {
      title: "Clients",
      value: String(stats?.clients ?? 0),
      change,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
