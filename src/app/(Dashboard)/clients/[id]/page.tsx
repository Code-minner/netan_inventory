"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MoreVertical } from "lucide-react";
import { BackArrow, EditIcon, PlusIcon } from "@/public/svg/svg";
import { useSetPageBreadcrumb } from "@/src/components/PageHeadingContext";
import { useAuth } from "@/src/components/AuthProvider";
import { apiFetch } from "@/src/lib/api";
import { formatDate } from "@/src/lib/format";
import {
  paymentStatusBadgeClass,
  paymentStatusLabel,
} from "@/src/lib/payment-status";
import type { Client, Payment } from "@/src/lib/types";

function fileNameFromUrl(url: string) {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").pop() || "File");
  } catch {
    return url.split("/").pop() || "File";
  }
}

export default function ClientDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { canWrite } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useSetPageBreadcrumb(
    client
      ? {
          parentLabel: "Clients",
          parentHref: "/clients",
          current: client.name,
        }
      : null,
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    apiFetch<{ client: Client; payments: Payment[] }>(
      `/api/clients/${params.id}`,
    )
      .then((data) => {
        if (cancelled) return;
        setClient(data.client);
        setPayments(data.payments || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setClient(null);
        setPayments([]);
        setError(err instanceof Error ? err.message : "Client not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const services = useMemo(() => {
    if (!client) return [];
    if (client.selectedServices?.length) return client.selectedServices;
    if (client.serviceType) {
      return client.serviceType.split(",").map((title, index) => ({
        id: `svc-${index}`,
        title: title.trim(),
        price: 0,
      }));
    }
    return [];
  }, [client]);

  const files = useMemo(() => {
    if (!client) return [];
    const list: { label: string; url: string }[] = [];
    if (client.projectDocumentUrl) {
      list.push({
        label: fileNameFromUrl(client.projectDocumentUrl),
        url: client.projectDocumentUrl,
      });
    }
    if (client.paymentProofUrl) {
      list.push({
        label: fileNameFromUrl(client.paymentProofUrl),
        url: client.paymentProofUrl,
      });
    }
    return list;
  }, [client]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 min-h-[calc(100dvh-11rem)] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading client…</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 min-h-[calc(100dvh-11rem)] flex flex-col items-center justify-center gap-3 px-6">
        <p className="text-sm text-red-500">{error || "Client not found"}</p>
        <button
          type="button"
          onClick={() => router.push("/clients")}
          className="text-sm font-medium text-[#2E2A5C] hover:underline"
        >
          Back to clients
        </button>
      </div>
    );
  }

  const since = formatDate(client.createdAt);
  const description =
    client.aboutProject ||
    client.projectDescription ||
    client.notes ||
    "No description provided yet.";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 w-full min-h-[calc(100dvh-11rem)] px-6 sm:px-8 lg:px-10 py-7 sm:py-8">
      <button
        type="button"
        onClick={() => router.push("/clients")}
        className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-6"
        aria-label="Back to clients"
      >
        <BackArrow size={20} />
      </button>

      <div className="flex items-start gap-4 pb-8 border-b border-gray-100">
        <span className="w-14 h-14 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center text-sm font-semibold shrink-0">
          {client.initials}
        </span>
        <div className="min-w-0 pt-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {client.name}
            </h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                client.status === "Ended"
                  ? "bg-green-50 text-green-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {client.status}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {client.servicesCount}{" "}
            {client.servicesCount === 1 ? "Service" : "Services"} — Client since{" "}
            {since}
          </p>
        </div>
      </div>

      <section className="py-8 border-b border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900">Client Info</h2>
          <span className="text-gray-400" aria-hidden>
            <EditIcon size={18} />
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <Info label="Client Name" value={client.name} />
          <Info label="Email Address" value={client.email} />
          <Info label="Phone Number" value={client.phone || "—"} />
        </div>
      </section>

      <section className="py-8 border-b border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900">Services</h2>
          {canWrite ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2E2A5C]">
              <PlusIcon size={14} />
              Add service
            </span>
          ) : null}
        </div>
        <div className="hidden sm:grid grid-cols-[1.6fr_1fr_1fr_1fr_40px] gap-3 text-xs text-gray-400 pb-3 px-1">
          <span>Service</span>
          <span>Start Date</span>
          <span>End Date</span>
          <span>Status</span>
          <span />
        </div>
        {services.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No services selected yet.
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => {
              const serviceStatus =
                client.status === "Ended" ? "Completed" : "In progress";
              return (
                <div
                  key={service.id}
                  className="grid grid-cols-1 sm:grid-cols-[1.6fr_1fr_1fr_1fr_40px] gap-2 sm:gap-3 items-center border border-gray-100 rounded-xl px-4 py-3.5"
                >
                  <p className="text-sm text-gray-800 font-medium truncate">
                    {service.title}
                  </p>
                  <p className="text-sm text-gray-500">{since}</p>
                  <p className="text-sm text-gray-500">
                    {client.timeline || client.date || "—"}
                  </p>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        serviceStatus === "Completed"
                          ? "bg-green-50 text-green-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {serviceStatus}
                    </span>
                  </div>
                  <div className="hidden sm:flex justify-end text-gray-300">
                    <MoreVertical size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="py-8 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Client Description
        </h2>
        <div className="rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {description}
        </div>
      </section>

      <section className="py-8 border-b border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900">Files</h2>
          {canWrite ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2E2A5C]">
              <PlusIcon size={14} />
              Upload file
            </span>
          ) : null}
        </div>
        {files.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No files uploaded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <a
                key={file.url}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl px-4 py-3.5 hover:border-gray-200"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {file.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Uploaded — {since}
                  </p>
                </div>
                <MoreVertical size={16} className="text-gray-300 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="pt-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">
          Payment History
        </h2>
        <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1.1fr_1fr_40px] gap-3 text-xs text-gray-400 pb-3 px-1">
          <span>Service</span>
          <span>Amount</span>
          <span>Paid</span>
          <span>Status</span>
          <span />
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No payments recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <Link
                key={payment.id}
                href={`/payments/${payment.id}`}
                className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1.1fr_1fr_40px] gap-2 sm:gap-3 items-center border border-gray-100 rounded-xl px-4 py-3.5 hover:border-gray-200"
              >
                <p className="text-sm text-gray-800 font-medium truncate">
                  {client.serviceType ||
                    `${payment.servicesCount} ${
                      payment.servicesCount === 1 ? "Service" : "Services"
                    }`}
                </p>
                <p className="text-sm text-gray-700">{payment.amount}</p>
                <div>
                  <p className="text-sm text-gray-800 font-medium">
                    {payment.paidAmount}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {payment.paidDate}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${paymentStatusBadgeClass(payment.status)}`}
                  >
                    {paymentStatusLabel(payment.status)}
                  </span>
                </div>
                <div className="hidden sm:flex justify-end text-gray-300">
                  <MoreVertical size={16} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
    </div>
  );
}
