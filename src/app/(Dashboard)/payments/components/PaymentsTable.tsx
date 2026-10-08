"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react";
import PaymentDetailsModal from "./PaymentDetailsModal";
import { apiFetch } from "@/src/lib/api";
import type { Payment, PaymentStatus } from "@/src/lib/types";

type Tab = "All" | "Completed" | "Not Completed";

const TABS: Tab[] = ["All", "Completed", "Not Completed"];
const PAGE_SIZE = 6;

function StatusBadge({ status }: { status: PaymentStatus }) {
  const styles =
    status === "Completed"
      ? "bg-green-50 text-green-600"
      : "bg-red-50 text-red-500";

  return (
    <span
      className={`inline-block whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
}

type Props = { refreshKey?: number };

export default function PaymentsTable({ refreshKey = 0 }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ payments: Payment[] }>("/api/payments");
      setPayments(data.payments);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      const matchesTab =
        activeTab === "All" || payment.status === activeTab;
      const matchesSearch = payment.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [payments, activeTab, search]);

  const visiblePayments = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100 p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3 pb-6">
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-3 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 border border-gray-200 rounded-xl outline-none focus:border-gray-300"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">
          <SlidersHorizontal size={15} />
          Filters
        </button>

        <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 sm:ml-auto">
          <ArrowUpDown size={15} />
          Sort by
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pb-6">
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`px-5 py-2 text-sm rounded-full transition-colors ${
                isActive
                  ? "bg-[#2E2A5C] text-white font-medium"
                  : "text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="hidden md:flex items-center px-4 pb-4 text-gray-400 text-sm">
        <div className="w-[28%]">Client</div>
        <div className="w-[18%]">Services</div>
        <div className="w-[16%]">Amount</div>
        <div className="w-[18%]">Paid</div>
        <div className="w-[16%]">Status</div>
        <div className="w-[4%]" />
      </div>

      <div className="flex flex-col gap-3.5">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-12">
            Loading payments…
          </div>
        ) : visiblePayments.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-12">
            No payments found.
          </div>
        ) : (
          visiblePayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center border border-gray-100 rounded-2xl px-4 py-4 hover:border-gray-200 transition-colors"
            >
              <div className="w-[28%] flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 shrink-0 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center text-xs font-semibold">
                  {payment.initials}
                </span>
                <span className="text-gray-800 text-sm font-medium truncate">
                  {payment.name}
                </span>
              </div>

              <div className="w-[18%]">
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
                  {payment.servicesCount}{" "}
                  {payment.servicesCount === 1 ? "Service" : "Services"}
                </span>
              </div>

              <div className="w-[16%] text-gray-700 text-sm">
                {payment.amount}
              </div>

              <div className="w-[18%]">
                <div className="text-gray-800 text-sm font-medium">
                  {payment.paidAmount}
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {payment.paidDate}
                </div>
              </div>

              <div className="w-[16%]">
                <StatusBadge status={payment.status} />
              </div>

              <div className="w-[4%] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(payment)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={`View payment for ${payment.name}`}
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-5 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            See more
          </button>
        </div>
      )}

      <PaymentDetailsModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  );
}
