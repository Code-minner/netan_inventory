"use client";

interface ReportStat {
  title: string;
  value: number;
  change: string;
  isPositive: boolean;
}

function StatCard({ title, value, change, isPositive }: ReportStat) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 px-6 py-6 flex-1">
      <p className="text-sm text-gray-400 mb-3">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 mb-3">{value}</p>
      <div className="flex items-center gap-1 text-xs">
        <span className={isPositive ? "text-green-600" : "text-red-500"}>
          {change}
        </span>
        <span className="text-gray-400">vs last month</span>
      </div>
    </div>
  );
}

type Props = {
  stats?: {
    totalClients: number;
    newClients: number;
    activeClients: number;
    inactiveClients: number;
    change: number;
  };
};

export default function ReportStatCards({ stats }: Props) {
  const changeLabel = `${stats && stats.change > 0 ? "+" : ""}${stats?.change ?? 0}%`;
  const cards: ReportStat[] = [
    {
      title: "Total Clients",
      value: stats?.totalClients ?? 0,
      change: changeLabel,
      isPositive: (stats?.change ?? 0) >= 0,
    },
    {
      title: "New Clients",
      value: stats?.newClients ?? 0,
      change: changeLabel,
      isPositive: (stats?.change ?? 0) >= 0,
    },
    {
      title: "Active Clients",
      value: stats?.activeClients ?? 0,
      change: changeLabel,
      isPositive: true,
    },
    {
      title: "Inactive Clients",
      value: stats?.inactiveClients ?? 0,
      change: changeLabel,
      isPositive: false,
    },
  ];

  return (
    <div className="flex gap-2 sm:gap-2 flex-wrap">
      {cards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
