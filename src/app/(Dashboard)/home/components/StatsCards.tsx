"use client";

import { ArrowUpIcon, ArrowDownIcon } from "../../../../../public/svg/svg";

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive?: boolean;
}

function StatCard({ title, value, change, isPositive = true }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100">
      <p className="text-sm text-gray-400 mb-3">{title}</p>

      <p className="text-2xl font-semibold text-gray-900 mb-3">{value}</p>

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

const STATS: StatCardProps[] = [
  { title: "Total clients", value: 24, change: "20%", isPositive: true },
  { title: "Total services", value: 36, change: "20%", isPositive: true },
  { title: "Active projects", value: 6, change: "20%", isPositive: true },
  { title: "Total payments", value: "₦10,033,600", change: "20%", isPositive: true },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}