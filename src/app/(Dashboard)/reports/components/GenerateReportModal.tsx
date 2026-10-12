"use client";

import { FormEvent, useState } from "react";
import Modal from "@/src/components/Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function GenerateReportModal({ isOpen, onClose }: Props) {
  const [reportType, setReportType] = useState("Client Report");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const params = new URLSearchParams({
        type: reportType,
        range: dateRange,
      });
      const response = await fetch(`/api/reports/export?${params}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Could not generate report");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        reportType === "Payment Report"
          ? "netan-payments.csv"
          : reportType === "Service Report"
            ? "netan-services.csv"
            : "netan-clients.csv";
      link.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate report");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Report"
      widthClassName="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="generate-report-form"
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E2A5C] rounded-xl hover:bg-[#25214a]"
          >
            Download CSV
          </button>
        </>
      }
    >
      <form
        id="generate-report-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#2E2A5C]/40"
          >
            <option>Client Report</option>
            <option>Payment Report</option>
            <option>Service Report</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#2E2A5C]/40"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
        {error ? (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2.5">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
