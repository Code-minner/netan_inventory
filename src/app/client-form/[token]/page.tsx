"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/src/lib/api";

type FormClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  formStatus: "pending" | "completed";
  company: string;
  serviceType: string;
  duration: string;
  notes: string;
  servicesCount: number;
};

export default function ClientFormPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [client, setClient] = useState<FormClient | null>(null);

  const [company, setCompany] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [duration, setDuration] = useState("1 Month");
  const [servicesCount, setServicesCount] = useState("1");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ client: FormClient }>(
          `/api/forms/${token}`,
        );
        if (cancelled) return;
        setClient(data.client);
        setCompany(data.client.company || data.client.name);
        setServiceType(data.client.serviceType || "");
        setDuration(data.client.duration || "1 Month");
        setServicesCount(String(data.client.servicesCount || 1));
        setNotes(data.client.notes || "");
        if (data.client.formStatus === "completed") setDone(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Invalid form link");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiFetch(`/api/forms/${token}`, {
        method: "POST",
        body: JSON.stringify({
          company,
          serviceType,
          duration,
          servicesCount: Number(servicesCount) || 1,
          notes,
        }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#EAE9F0] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-wide text-[#2E2A5C] uppercase mb-2">
            Netan
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Client onboarding form
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Fill in your details so we can set up your services.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-10">Loading…</p>
          ) : error && !client ? (
            <p className="text-sm text-red-500 text-center py-10">{error}</p>
          ) : done ? (
            <div className="text-center py-8 space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Form submitted
              </h2>
              <p className="text-sm text-gray-500">
                Thanks{client?.name ? `, ${client.name}` : ""}. Your details have
                been sent to the Netan team.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadOnly label="Email" value={client?.email || ""} />
                <ReadOnly label="Phone" value={client?.phone || ""} />
              </div>

              <Field
                label="Company / client name"
                value={company}
                onChange={setCompany}
                required
                placeholder="Your company name"
              />

              <Field
                label="Service type"
                value={serviceType}
                onChange={setServiceType}
                required
                placeholder="e.g. Website Development"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Number of services
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={servicesCount}
                    onChange={(e) => setServicesCount(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E2A5C]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#2E2A5C]/50"
                  >
                    <option>1 Month</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                    <option>1 Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Anything else we should know?"
                  className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none resize-none focus:border-[#2E2A5C]/50"
                />
              </div>

              {error ? (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#2E2A5C] text-white text-sm font-medium hover:bg-[#25214a] disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit form"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E2A5C]/50"
      />
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1.5">{label}</p>
      <div className="px-3.5 py-3 text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl">
        {value || "—"}
      </div>
    </div>
  );
}
