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
  const [format, setFormat] = useState("PDF");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => {
      setDone(false);
      onClose();
    }, 800);
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
            Generate
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#2E2A5C]/40"
          >
            <option>PDF</option>
            <option>CSV</option>
            <option>Excel</option>
          </select>
        </div>
        {done ? (
          <p className="text-sm text-green-600 bg-green-50 rounded-xl px-3 py-2.5">
            Report ready ({reportType} · {format})
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
