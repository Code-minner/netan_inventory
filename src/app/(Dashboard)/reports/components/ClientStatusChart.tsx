"use client";

import { PieChart, Pie, Cell } from "recharts";

const SIZE = 170;

export default function ClientStatusChart({
  active,
  inactive,
}: {
  active: number;
  inactive: number;
}) {
  const total = active + inactive;
  const data = [
    {
      name: "Active",
      value: active,
      percent: total ? `${Math.round((active / total) * 100)}%` : "0%",
      color: "#2E2A5C",
    },
    {
      name: "Inactive",
      value: inactive,
      percent: total ? `${Math.round((inactive / total) * 100)}%` : "0%",
      color: "#F97316",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-7 sm:p-8 w-full h-full">
      <h3 className="text-sm font-semibold text-gray-900 mb-6">Client Status</h3>

      <div className="flex items-center gap-10">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <PieChart width={SIZE} height={SIZE} className="w-full h-full pr-2 pb-2">
            <Pie
              data={total ? data : [{ name: "Empty", value: 1, color: "#E5E7EB" }]}
              dataKey="value"
              cx={SIZE / 2}
              cy={SIZE / 2}
              innerRadius={55}
              outerRadius={78}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {(total ? data : [{ name: "Empty", color: "#E5E7EB" }]).map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-semibold text-gray-900">{total}</span>
            <span className="text-xs text-gray-400">Total Clients</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-3 text-sm">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700 w-16">{entry.name}</span>
              <span className="font-semibold text-gray-900">{entry.percent}</span>
              <span className="text-gray-400">({entry.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
