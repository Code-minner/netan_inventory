"use client";

import { PieChart, Pie, Cell } from "recharts";

const SIZE = 180;

export default function PaymentStatusChart({
  paid,
  outstanding,
}: {
  paid: number;
  outstanding: number;
}) {
  const total = paid + outstanding;
  const data = [
    {
      name: "Paid",
      value: paid,
      percent: total ? `${((paid / total) * 100).toFixed(1)}%` : "0%",
      color: "#2E2A5C",
    },
    {
      name: "Outstanding",
      value: outstanding,
      percent: total
        ? `${((outstanding / total) * 100).toFixed(1)}%`
        : "0%",
      color: "#F97316",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-7 sm:p-8 w-full h-full min-h-[420px]">
      <h3 className="text-sm font-semibold text-gray-900 mb-8">
        Payment Status
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10">
        <div
          className="relative shrink-0"
          style={{ width: SIZE, height: SIZE }}
        >
          <PieChart width={SIZE} height={SIZE}>
            <Pie
              data={
                total ? data : [{ name: "Empty", value: 1, color: "#E5E7EB" }]
              }
              dataKey="value"
              cx={SIZE / 2}
              cy={SIZE / 2}
              innerRadius={58}
              outerRadius={82}
              startAngle={90}
              endAngle={-270}
              paddingAngle={total ? 2 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {(total ? data : [{ name: "Empty", color: "#E5E7EB" }]).map(
                (entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ),
              )}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-semibold text-gray-900 leading-none">
              {total}
            </span>
            <span className="text-xs text-gray-400 mt-1 text-center leading-tight px-4">
              Total Payment
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full sm:w-auto">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-3 text-sm">
              <span
                className="w-3 h-3 rounded-[3px] shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700 w-[88px]">{entry.name}</span>
              <span className="font-semibold text-gray-900">
                {entry.percent}
              </span>
              <span className="text-gray-400">({entry.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
