// app/reports/components/ReportStatCards.tsx
"use client";

import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface ReportStat {
  title: string;
  value: number;
  change: string;
  isPositive: boolean;
}

const STATS: ReportStat[] = [
  { title: "Total Clients", value: 38, change: "20%", isPositive: true },
  { title: "New Clients", value: 7, change: "20%", isPositive: true },
  { title: "Active Clients", value: 32, change: "20%", isPositive: true },
  { title: "Inactive Clients", value: 6, change: "20%", isPositive: false },
];

function StatCard({ title, value, change, isPositive }: ReportStat) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex-1">
      <p className="text-sm text-gray-400 mb-2">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 mb-2">{value}</p>
      <div className="flex items-center gap-1 text-xs">
        <span className={isPositive ? "text-green-600" : "text-red-500"}>
          {isPositive ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
        </span>
        <span className={isPositive ? "text-green-600" : "text-red-500"}>
          {change}
        </span>
        <span className="text-gray-400">vs last month</span>
      </div>
    </div>
  );
}

export default function ReportStatCards() {
  return (
    <div className="flex gap-4">
      {STATS.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}