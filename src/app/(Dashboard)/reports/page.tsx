"use client";

import { useCallback, useEffect, useState } from "react";
import ReportStatCards from "./components/ReportStatCards";
import RevenueOverviewChart from "./components/RevenueOverviewChart";
import PaymentStatusChart from "./components/PaymentStatusChart";
import GenerateReportModal from "./components/GenerateReportModal";
import { ChevronDownIcon } from "@/public/svg/svg";
import { apiFetch } from "@/src/lib/api";

type ReportsData = {
  year: number;
  years: number[];
  stats: {
    totalRevenue: number;
    payments: number;
    outstanding: number;
    clients: number;
    change: number;
  };
  revenue: { month: string; revenue: number }[];
  paymentStatus: {
    paid: number;
    outstanding: number;
  };
};

const DATE_RANGES = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This year",
];

const REPORT_TYPES = [
  "Client Report",
  "Payment Report",
  "Service Report",
];

export default function ReportsPage() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [data, setData] = useState<ReportsData | null>(null);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [reportType, setReportType] = useState("Client Report");

  const load = useCallback(async (selectedYear: string) => {
    try {
      const next = await apiFetch<ReportsData>(
        `/api/reports?year=${encodeURIComponent(selectedYear)}`,
      );
      setData(next);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    void load(year);
  }, [load, year]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <h1 className="text-[22px] font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            View and analyze your client and payment records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none w-full sm:w-auto min-w-[140px] pl-4 pr-10 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#2E2A5C]/40"
            >
              {DATE_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="relative">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="appearance-none w-full sm:w-auto min-w-[150px] pl-4 pr-10 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#2E2A5C]/40"
            >
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            className="sm:ml-auto bg-[#2E2A5C] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#25214a] shrink-0"
          >
            Generate Report
          </button>
        </div>
      </div>

      <ReportStatCards stats={data?.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-3">
        <RevenueOverviewChart
          year={year}
          years={data?.years || [Number(year)]}
          data={data?.revenue || []}
          onYearChange={setYear}
        />
        <PaymentStatusChart
          paid={data?.paymentStatus.paid || 0}
          outstanding={data?.paymentStatus.outstanding || 0}
        />
      </div>

      <GenerateReportModal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        initialReportType={reportType}
        initialDateRange={dateRange}
      />
    </div>
  );
}
