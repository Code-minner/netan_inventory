// app/reports/components/ClientsGrowthChart.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DATA = [
  { month: "JAN", clients: 33 },
  { month: "FEB", clients: 45 },
  { month: "MAR", clients: 34 },
  { month: "APR", clients: 46 },
  { month: "MAY", clients: 35 },
  { month: "JUN", clients: 47 },
  { month: "JUL", clients: 37 },
  { month: "AUG", clients: 52 },
  { month: "SEP", clients: 30 },
  { month: "OCT", clients: 44 },
  { month: "NOV", clients: 38 },
  { month: "DEC", clients: 50 },
];

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (payload.month !== "JUL") return null;

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
      <circle cx={cx} cy={cy} r={4} fill="#2E2A5C" stroke="white" strokeWidth={2} />
      <foreignObject x={cx - 18} y={cy - 38} width={36} height={24}>
        <div className="bg-[#2E2A5C] text-white text-xs font-medium rounded-full w-9 h-6 flex items-center justify-center">
          {payload.clients}
        </div>
      </foreignObject>
    </g>
  );
}

export default function ClientsGrowthChart() {
  const [year, setYear] = useState("2026");

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Clients Growth</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg">
          {year}
          <ChevronDown size={14} />
        </button>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={DATA} margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
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
            domain={[0, 60]}
            ticks={[0, 10, 20, 30, 40, 50, 60]}
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
            dot={<CustomDot />}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}