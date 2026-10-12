"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ClientsTable from "./components/ClientsTable";
import NewClientModal from "./components/NewClientModal";
import { useAuth } from "@/src/components/AuthProvider";

export default function ClientsPage() {
  const { canWrite } = useAuth();
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-[22px] font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            Manage your clients, view their details, and track their projects and
            payments.
          </p>
        </div>

        {canWrite ? (
          <button
            type="button"
            onClick={() => setNewClientOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#2E2A5C] text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-[#25214a] shrink-0"
          >
            <Plus size={16} />
            New Client
          </button>
        ) : null}
      </div>

      <ClientsTable refreshKey={refreshKey} />

      <NewClientModal
        isOpen={newClientOpen}
        onClose={() => setNewClientOpen(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
