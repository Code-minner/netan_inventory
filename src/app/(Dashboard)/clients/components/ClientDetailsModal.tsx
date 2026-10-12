"use client";

import { useState } from "react";
import Modal from "@/src/components/Modal";
import type { Client } from "@/src/lib/types";

type Props = {
  client: Client | null;
  onClose: () => void;
};

export default function ClientDetailsModal({ client, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const frontendUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_FRONTEND_URL || "";
  const formUrl = client
    ? `${frontendUrl}/client-form/${client.formToken}`
    : "";

  const copyLink = async () => {
    if (!formUrl) return;
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

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
            {client.projectName ? (
              <Detail label="Project" value={client.projectName} />
            ) : null}
            {client.budget ? (
              <Detail label="Budget" value={client.budget} />
            ) : null}
          </div>

          {client.projectDescription ? (
            <NoteBlock label="Project description" text={client.projectDescription} />
          ) : null}
          {client.goals ? <NoteBlock label="Goals" text={client.goals} /> : null}
          {client.notes ? <NoteBlock label="Notes" text={client.notes} /> : null}

          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">Customer form link</p>
            <p className="text-sm text-[#2E2A5C] break-all">{formUrl}</p>
            <button
              type="button"
              onClick={copyLink}
              className="mt-2 text-sm font-medium text-[#2E2A5C] hover:underline"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
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

function NoteBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3.5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{text}</p>
    </div>
  );
}
