"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreVertical,
  Check,
} from "lucide-react";
import ClientDetailsModal from "./ClientDetailsModal";
import { apiFetch } from "@/src/lib/api";
import type { Client, ClientStatus, FormStatus } from "@/src/lib/types";

type Tab = "All" | ClientStatus;
type FormFilter = "All" | FormStatus;
type SortKey = "newest" | "oldest" | "name-asc" | "name-desc" | "services";

const TABS: Tab[] = ["All", "Ended", "Ongoing"];
const PAGE_SIZE = 6;

const FORM_FILTERS: { value: FormFilter; label: string }[] = [
  { value: "All", label: "All forms" },
  { value: "pending", label: "Form pending" },
  { value: "completed", label: "Form completed" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "services", label: "Most services" },
];

function StatusBadge({ status }: { status: ClientStatus }) {
  const styles =
    status === "Ended"
      ? "bg-green-50 text-green-600"
      : "bg-amber-50 text-amber-500";

  return (
    <span
      className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${styles}`}
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

type Props = {
  refreshKey?: number;
};

export default function ClientsTable({ refreshKey = 0 }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [formFilter, setFormFilter] = useState<FormFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ clients: Client[] }>("/api/clients");
      setClients(data.clients);
    } catch (err) {
      setClients([]);
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const filtered = useMemo(() => {
    const list = clients.filter((client) => {
      const matchesTab = activeTab === "All" || client.status === activeTab;
      const matchesForm =
        formFilter === "All" || client.formStatus === formFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.phone.toLowerCase().includes(q);
      return matchesTab && matchesForm && matchesSearch;
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
        case "services":
          return b.servicesCount - a.servicesCount;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
    return sorted;
  }, [clients, activeTab, formFilter, search, sortKey]);

  const visibleClients = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const formFilterLabel =
    FORM_FILTERS.find((f) => f.value === formFilter)?.label || "Filters";
  const sortLabel =
    SORT_OPTIONS.find((s) => s.value === sortKey)?.label || "Sort by";

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100 p-7 sm:p-10 min-h-[480px]">
      <div className="flex flex-wrap items-center gap-3 pb-8">
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
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
              formFilter !== "All"
                ? "border-[#2E2A5C] text-[#2E2A5C]"
                : "border-gray-200 text-gray-500"
            }`}
          >
            <SlidersHorizontal size={15} />
            {formFilter === "All" ? "Filters" : formFilterLabel}
          </button>
          <DropdownMenu
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          >
            {FORM_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFormFilter(option.value);
                  setVisibleCount(PAGE_SIZE);
                  setFiltersOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                {option.label}
                {formFilter === option.value ? (
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

      <div className="flex items-center gap-2.5 pb-8">
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

      <div className="hidden lg:flex items-center px-4 pb-4 text-gray-400 text-sm gap-2">
        <div className="w-[26%]">Client</div>
        <div className="w-[22%]">Email</div>
        <div className="w-[14%]">Phone</div>
        <div className="w-[12%]">Services</div>
        <div className="w-[12%]">Form</div>
        <div className="w-[10%]">Status</div>
        <div className="w-[4%]" />
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-16">
            Loading clients…
          </div>
        ) : error ? (
          <div className="text-center text-sm text-red-500 py-16 px-4">
            {error}
          </div>
        ) : visibleClients.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-16">
            No clients found.
          </div>
        ) : (
          visibleClients.map((client) => (
            <div
              key={client.id}
              className="flex flex-col lg:flex-row lg:items-center gap-3 border border-gray-100 rounded-lg px-5 py-5 hover:border-gray-200 transition-colors"
            >
              <div className="lg:w-[26%] flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 shrink-0 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center text-xs font-semibold">
                  {client.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-gray-800 text-sm font-medium truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-gray-400 lg:hidden truncate">
                    {client.email}
                  </p>
                </div>
              </div>

              <div className="hidden lg:block lg:w-[22%] text-gray-700 text-sm truncate pr-2">
                {client.email}
              </div>
              <div className="hidden lg:block lg:w-[14%] text-gray-700 text-sm truncate">
                {client.phone}
              </div>

              <div className="lg:w-[12%]">
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
                  {client.servicesCount}{" "}
                  {client.servicesCount === 1 ? "Service" : "Services"}
                </span>
              </div>

              <div className="lg:w-[12%]">
                <span
                  className={`inline-block text-xs px-3 py-1.5 rounded-full font-medium ${
                    client.formStatus === "completed"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {client.formStatus === "completed" ? "Completed" : "Pending"}
                </span>
              </div>

              <div className="lg:w-[10%]">
                <StatusBadge status={client.status} />
              </div>

              <div className="lg:w-[4%] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedClient(client)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label={`View ${client.name}`}
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

      <ClientDetailsModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  );
}
