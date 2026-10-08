"use client";

import Modal from "@/src/components/Modal";
import type { Client } from "@/src/lib/types";

type Props = {
  client: Client | null;
  onClose: () => void;
};

export default function ClientDetailsModal({ client, onClose }: Props) {
  const frontendUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_FRONTEND_URL || "";

  return (
    <Modal
      isOpen={Boolean(client)}
      onClose={onClose}
      title="Client details"
      widthClassName="max-w-lg"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E2A5C] rounded-xl hover:bg-[#25214a]"
        >
          Close
        </button>
      }
    >
      {client ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center text-sm font-semibold">
              {client.initials}
            </span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {client.name}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">{client.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-sm">
            <Detail label="Phone" value={client.phone} />
            <Detail label="Services" value={`${client.servicesCount}`} />
            <Detail label="Duration" value={client.duration} />
            <Detail label="Date" value={client.date} />
            <Detail label="Status" value={client.status} />
            <Detail
              label="Form"
              value={
                client.formStatus === "completed" ? "Completed" : "Pending"
              }
            />
            {client.serviceType ? (
              <Detail label="Service type" value={client.serviceType} />
            ) : null}
            {client.company ? (
              <Detail label="Company" value={client.company} />
            ) : null}
          </div>

          {client.notes ? (
            <div className="rounded-xl bg-gray-50 px-4 py-3.5">
              <p className="text-xs text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-800">{client.notes}</p>
            </div>
          ) : null}

          {client.formStatus === "pending" ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-3.5">
              <p className="text-xs text-gray-400 mb-1">Form link</p>
              <p className="text-sm text-[#2E2A5C] break-all">
                {frontendUrl}/client-form/{client.formToken}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3.5 py-3.5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}
