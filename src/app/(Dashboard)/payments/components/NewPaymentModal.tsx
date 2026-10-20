"use client";

import { FormEvent, useEffect, useState } from "react";
import Modal from "@/src/components/Modal";
import { apiFetch } from "@/src/lib/api";
import type { Client, Payment } from "@/src/lib/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (payment: Payment) => void;
};

export default function NewPaymentModal({ isOpen, onClose, onCreated }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [servicesCount, setServicesCount] = useState("1");
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [status, setStatus] = useState<"Completed" | "Not Completed">(
    "Completed",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    apiFetch<{ clients: Client[] }>("/api/clients")
      .then((data) => setClients(data.clients))
      .catch(() => setClients([]));
  }, [isOpen]);

  const reset = () => {
    setClientId("");
    setName("");
    setServicesCount("1");
    setAmount("");
    setPaidAmount("");
    setStatus("Completed");
    setError("");
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleClientChange = (id: string) => {
    setClientId(id);
    const client = clients.find((c) => c.id === id);
    if (client) {
      setName(client.name);
      setServicesCount(String(client.servicesCount || 1));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ payment: Payment }>("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          clientId: clientId || undefined,
          name: name.trim(),
          servicesCount: Number(servicesCount) || 1,
          amount,
          paidAmount,
          status,
        }),
      });
      onCreated?.(data.payment);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Payment"
      widthClassName="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-payment-form"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E2A5C] rounded-lg hover:bg-[#25214a] disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save payment"}
          </button>
        </>
      }
    >
      <form id="new-payment-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client
          </label>
          <select
            value={clientId}
            onChange={(e) => handleClientChange(e.target.value)}
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none bg-white focus:border-[#2E2A5C]/40 mb-3"
          >
            <option value="">Select existing client (optional)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Client name"
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#2E2A5C]/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services
          </label>
          <input
            type="number"
            min={1}
            value={servicesCount}
            onChange={(e) => setServicesCount(e.target.value)}
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#2E2A5C]/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="₦0"
              className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#2E2A5C]/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paid
            </label>
            <input
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              required
              placeholder="₦0"
              className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#2E2A5C]/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "Completed" | "Not Completed")
            }
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none bg-white focus:border-[#2E2A5C]/40"
          >
            <option value="Completed">Completed</option>
            <option value="Not Completed">Not Completed</option>
          </select>
        </div>

        {error ? (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2.5">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
