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

type Point = { month: string; revenue: number };

function formatAxis(value: number) {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}m`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${Number.isInteger(k) ? k : k.toFixed(0)}k`;
  }
  return String(value);
}

function formatTip(value: number) {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `₦${Number.isInteger(m) ? m : m.toFixed(1)}m`;
  }
  if (value >= 1_000) {
    return `₦${Math.round(value / 1_000)}k`;
  }
  return `₦${value}`;
}

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
        y1={20}
        x2={cx}
        y2={240}
        stroke="#EEEDF5"
        strokeWidth={28}
        strokeLinecap="round"
      />
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#2E2A5C"
        stroke="white"
        strokeWidth={2}
      />
      <foreignObject x={cx - 28} y={cy - 42} width={56} height={28}>
        <div className="bg-[#2E2A5C] text-white text-[11px] font-medium rounded-full h-7 flex items-center justify-center px-2">
          {formatTip(payload.revenue)}
        </div>
      </foreignObject>
    </g>
  );
}

export default function RevenueOverviewChart({
  year,
  years,
  data,
  onYearChange,
}: {
  year: string;
  years: number[];
  data: Point[];
  onYearChange: (year: string) => void;
}) {
  const highlight =
    [...data].reverse().find((point) => point.revenue > 0)?.month ||
    data[data.length - 1]?.month ||
    "";
  const max = Math.max(200_000, ...data.map((point) => point.revenue), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-7 sm:p-8 flex-1 min-h-[420px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-900">
          Revenue Overview
        </h3>
        <select
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#2E2A5C]/40"
        >
          {(years.length ? years : [Number(year)]).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 28, right: 12, bottom: 0, left: 0 }}
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
            tickFormatter={formatAxis}
            width={48}
          />
          <Tooltip
            formatter={(value) => [
              formatTip(Number(value) || 0),
              "Revenue",
            ]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2E2A5C"
            strokeWidth={2.5}
            dot={<CustomDot highlight={highlight} />}
            activeDot={{ r: 5, fill: "#2E2A5C" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
