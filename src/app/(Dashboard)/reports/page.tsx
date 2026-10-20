"use client";

import { useEffect, useState } from "react";
import ReportStatCards from "./components/ReportStatCards";
import ClientsGrowthChart from "./components/ClientsGrowthChart";
import ClientStatusChart from "./components/ClientStatusChart";
import GenerateReportModal from "./components/GenerateReportModal";
import { apiFetch } from "@/src/lib/api";

type ReportsData = {
  year: number;
  stats: {
    totalClients: number;
    newClients: number;
    activeClients: number;
    inactiveClients: number;
    change: number;
  };
  growth: { month: string; clients: number }[];
};

export default function ReportsPage() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [data, setData] = useState<ReportsData | null>(null);

  useEffect(() => {
    apiFetch<ReportsData>("/api/reports")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="space-y-3 mb-6">
          <h1 className="text-[22px] font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            View and analyze your client and payment records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setGenerateOpen(true)}
          className="bg-[#2E2A5C] text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-[#25214a] shrink-0"
        >
          Generate Report
        </button>
      </div>

      <ReportStatCards stats={data?.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-2 sm:gap-2">
        <ClientsGrowthChart
          year={String(data?.year || new Date().getFullYear())}
          data={data?.growth || []}
        />
        <ClientStatusChart
          active={data?.stats.activeClients || 0}
          inactive={data?.stats.inactiveClients || 0}
        />
      </div>

      <GenerateReportModal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
      />
    </div>
  );
}
