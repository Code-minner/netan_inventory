"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Point = { month: string; clients: number };

function CustomDot(
  props: { cx?: number; cy?: number; payload?: Point } & { highlight: string },
) {
  const { cx, cy, payload, highlight } = props;
  if (!payload || payload.month !== highlight || cx == null || cy == null) {
    return null;
  }

  return (
    <g>
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={310}
        stroke="#E5E7EB"
        strokeWidth={16}
        strokeLinecap="round"
      />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#2E2A5C"
        stroke="white"
        strokeWidth={2}
      />
      <foreignObject x={cx - 18} y={cy - 38} width={36} height={24}>
        <div className="bg-[#2E2A5C] text-white text-xs font-medium rounded-full w-9 h-6 flex items-center justify-center">
          {payload.clients}
        </div>
      </foreignObject>
    </g>
  );
}

export default function ClientsGrowthChart({
  year,
  data,
}: {
  year: string;
  data: Point[];
}) {
  const highlight =
    [...data].reverse().find((point) => point.clients > 0)?.month ||
    data[data.length - 1]?.month ||
    "";
  const max = Math.max(6, ...data.map((point) => point.clients), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-7 sm:p-8 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Clients Growth</h3>
        <span className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg">
          {year}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 10, bottom: 0, left: -20 }}
        >
          <CartesianGrid vertical={false} stroke="#F3F4F6" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            domain={[0, max]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="clients"
            stroke="#2E2A5C"
            strokeWidth={2}
            dot={<CustomDot highlight={highlight} />}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
