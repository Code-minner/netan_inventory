"use client";

import { FormEvent, useState } from "react";
import Modal from "@/src/components/Modal";
import { apiFetch } from "@/src/lib/api";
import type { Client } from "@/src/lib/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (client: Client) => void;
};

export default function NewClientModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [servicesCount, setServicesCount] = useState("1");
  const [duration, setDuration] = useState("1 Month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setServicesCount("1");
    setDuration("1 Month");
    setError("");
    setSuccess("");
    setFormUrl("");
    setCopied(false);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await apiFetch<{
        client: Client;
        formUrl: string;
        emailSent: boolean;
        emailError?: string;
      }>("/api/clients", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          servicesCount: Number(servicesCount) || 1,
          duration,
          status: "Ongoing",
        }),
      });

      onCreated?.(data.client);
      setFormUrl(data.formUrl);

      if (data.emailSent) {
        setSuccess("Client added. Form invite email sent.");
      } else {
        setSuccess(
          `Client added, but email failed${data.emailError ? `: ${data.emailError}` : "."} Copy the form link below and send it yourself.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Client"
      widthClassName="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-client-form"
            disabled={loading || Boolean(formUrl)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E2A5C] rounded-xl hover:bg-[#25214a] disabled:opacity-60"
          >
            {loading ? "Adding…" : formUrl ? "Added" : "Add Client"}
          </button>
        </>
      }
    >
      <form id="new-client-form" onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-gray-500">
          We’ll email the client a link to complete their onboarding form.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Tolu & Kene Studio"
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E2A5C]/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="client@company.com"
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E2A5C]/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone number
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="+234 800 000 0000"
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E2A5C]/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services
            </label>
            <input
              type="number"
              min={1}
              value={servicesCount}
              onChange={(e) => setServicesCount(e.target.value)}
              className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E2A5C]/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#2E2A5C]/40"
            >
              <option>1 Month</option>
              <option>3 Months</option>
              <option>6 Months</option>
              <option>1 Year</option>
            </select>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2.5">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-green-600 bg-green-50 rounded-xl px-3 py-2.5">
            {success}
          </p>
        ) : null}
        {formUrl ? (
          <div className="rounded-xl border border-dashed border-gray-200 px-3.5 py-3">
            <p className="text-xs text-gray-400 mb-1">Customer form link</p>
            <p className="text-sm text-[#2E2A5C] break-all">{formUrl}</p>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(formUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  setCopied(false);
                }
              }}
              className="mt-2 text-sm font-medium text-[#2E2A5C] hover:underline"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
