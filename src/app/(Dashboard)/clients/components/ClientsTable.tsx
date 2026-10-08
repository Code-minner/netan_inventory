"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react";
import ClientDetailsModal from "./ClientDetailsModal";
import { apiFetch } from "@/src/lib/api";
import type { Client, ClientStatus } from "@/src/lib/types";

type Tab = "All" | ClientStatus;

const TABS: Tab[] = ["All", "Ended", "Ongoing"];
const PAGE_SIZE = 6;

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

type Props = {
  refreshKey?: number;
};

export default function ClientsTable({ refreshKey = 0 }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ clients: Client[] }>("/api/clients");
      setClients(data.clients);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      const matchesTab = activeTab === "All" || client.status === activeTab;
      const q = search.toLowerCase();
      const matchesSearch =
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.phone.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [clients, activeTab, search]);

  const visibleClients = filtered.slice(0, visibleCount);
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

      <div className="flex items-center gap-2.5 pb-6">
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

      <div className="flex flex-col gap-3.5">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-12">
            Loading clients…
          </div>
        ) : visibleClients.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-12">
            No clients found.
          </div>
        ) : (
          visibleClients.map((client) => (
            <div
              key={client.id}
              className="flex flex-col lg:flex-row lg:items-center gap-3 border border-gray-100 rounded-2xl px-4 py-4 hover:border-gray-200 transition-colors"
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
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-5 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50"
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
