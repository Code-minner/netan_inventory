"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ReportStatCards from "./components/ReportStatCards";
import ClientsGrowthChart from "./components/ClientsGrowthChart";
import ClientStatusChart from "./components/ClientStatusChart";
import GenerateReportModal from "./components/GenerateReportModal";

export default function ReportsPage() {
  const [dateRange] = useState("Date Range");
  const [reportType] = useState("Client Report");
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-[22px] font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            View and analyze your client and payment records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setGenerateOpen(true)}
          className="bg-[#2E2A5C] text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-[#25214a] shrink-0"
        >
          Generate Report
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl">
          {dateRange}
          <ChevronDown size={14} />
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl">
          {reportType}
          <ChevronDown size={14} />
        </button>
      </div>

      <ReportStatCards />

      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5">
        <ClientsGrowthChart />
        <ClientStatusChart />
      </div>

      <GenerateReportModal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
      />
    </div>
  );
}
