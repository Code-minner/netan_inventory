"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SlidersHorizontal,
  ArrowUpDown,
  MoreVertical,
  Check,
} from "lucide-react";
import { SearchIcon } from "@/public/svg/svg";
import PaymentDetailsModal from "./PaymentDetailsModal";
import { apiFetch } from "@/src/lib/api";
import type { Payment, PaymentStatus } from "@/src/lib/types";

type Tab = "All" | "Completed" | "Not Completed";
type ServicesFilter = "All" | "1" | "2+";
type SortKey =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "amount-high"
  | "amount-low";

const TABS: Tab[] = ["All", "Completed", "Not Completed"];
const PAGE_SIZE = 6;

const SERVICE_FILTERS: { value: ServicesFilter; label: string }[] = [
  { value: "All", label: "All services" },
  { value: "1", label: "1 service" },
  { value: "2+", label: "2+ services" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "amount-high", label: "Amount high–low" },
  { value: "amount-low", label: "Amount low–high" },
];

function parseMoney(value: string) {
  const n = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

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

type MenuProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
};

function DropdownMenu({ open, onClose, children, align = "left" }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={`absolute top-full mt-2 z-20 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg ${
        align === "right" ? "right-0" : "left-0"
      }`}
    >
      {children}
    </div>
  );
}

type Props = { refreshKey?: number };

export default function PaymentsTable({ refreshKey = 0 }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [servicesFilter, setServicesFilter] = useState<ServicesFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
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
    const list = payments.filter((payment) => {
      const matchesTab = activeTab === "All" || payment.status === activeTab;
      const matchesServices =
        servicesFilter === "All" ||
        (servicesFilter === "1"
          ? payment.servicesCount === 1
          : payment.servicesCount >= 2);
      const matchesSearch = payment.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesTab && matchesServices && matchesSearch;
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "amount-high":
          return parseMoney(b.amount) - parseMoney(a.amount);
        case "amount-low":
          return parseMoney(a.amount) - parseMoney(b.amount);
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
    return sorted;
  }, [payments, activeTab, servicesFilter, search, sortKey]);

  const visiblePayments = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const filterLabel =
    SERVICE_FILTERS.find((f) => f.value === servicesFilter)?.label || "Filters";
  const sortLabel =
    SORT_OPTIONS.find((s) => s.value === sortKey)?.label || "Sort by";

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100 p-7 sm:p-10 min-h-[480px]">
      <div className="flex flex-wrap items-center gap-3 pb-8">
        <div className="relative w-full sm:w-64">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-gray-400">
            <SearchIcon size={16} />
          </span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search"
            className="w-full pl-10 pr-3 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 border border-gray-200 rounded-lg outline-none focus:border-gray-300"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setFiltersOpen((o) => !o);
              setSortOpen(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-lg hover:bg-gray-50 ${
              servicesFilter !== "All"
                ? "border-[#2E2A5C] text-[#2E2A5C]"
                : "border-gray-200 text-gray-500"
            }`}
          >
            <SlidersHorizontal size={15} />
            {servicesFilter === "All" ? "Filters" : filterLabel}
          </button>
          <DropdownMenu
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          >
            {SERVICE_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setServicesFilter(option.value);
                  setVisibleCount(PAGE_SIZE);
                  setFiltersOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                {option.label}
                {servicesFilter === option.value ? (
                  <Check size={14} className="text-[#2E2A5C]" />
                ) : null}
              </button>
            ))}
          </DropdownMenu>
        </div>

        <div className="relative sm:ml-auto">
          <button
            type="button"
            onClick={() => {
              setSortOpen((o) => !o);
              setFiltersOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ArrowUpDown size={15} />
            {sortKey === "newest" ? "Sort by" : sortLabel}
          </button>
          <DropdownMenu
            open={sortOpen}
            onClose={() => setSortOpen(false)}
            align="right"
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSortKey(option.value);
                  setVisibleCount(PAGE_SIZE);
                  setSortOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                {option.label}
                {sortKey === option.value ? (
                  <Check size={14} className="text-[#2E2A5C]" />
                ) : null}
              </button>
            ))}
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pb-8">
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

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-16">
            Loading payments…
          </div>
        ) : visiblePayments.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-16">
            No payments found.
          </div>
        ) : (
          visiblePayments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-col md:flex-row md:items-center gap-3 border border-gray-100 rounded-lg px-5 py-5 hover:border-gray-200 transition-colors"
            >
              <div className="md:w-[28%] flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 shrink-0 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center text-xs font-semibold">
                  {payment.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-gray-800 text-sm font-medium truncate">
                    {payment.name}
                  </p>
                  <p className="text-xs text-gray-400 md:hidden mt-0.5">
                    {payment.amount} · {payment.paidAmount}
                  </p>
                </div>
              </div>

              <div className="md:w-[18%]">
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
                  {payment.servicesCount}{" "}
                  {payment.servicesCount === 1 ? "Service" : "Services"}
                </span>
              </div>

              <div className="hidden md:block md:w-[16%] text-gray-700 text-sm">
                {payment.amount}
              </div>

              <div className="hidden md:block md:w-[18%]">
                <div className="text-gray-800 text-sm font-medium">
                  {payment.paidAmount}
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {payment.paidDate}
                </div>
              </div>

              <div className="md:w-[16%] flex items-center justify-between gap-3">
                <StatusBadge status={payment.status} />
                <button
                  type="button"
                  onClick={() => setSelectedPayment(payment)}
                  className="text-gray-400 hover:text-gray-600 md:hidden p-1"
                  aria-label={`View payment for ${payment.name}`}
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="hidden md:flex md:w-[4%] justify-end">
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
        <div className="flex justify-center pt-10">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-5 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
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
