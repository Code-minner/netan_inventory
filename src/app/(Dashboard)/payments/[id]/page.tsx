"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, BackArrow } from "@/public/svg/svg";
import { apiFetch } from "@/src/lib/api";
import { formatDate, formatTime } from "@/src/lib/format";
import type { Client, Payment } from "@/src/lib/types";

function fileNameFromUrl(url: string) {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").pop() || "Payment proof");
  } catch {
    return url.split("/").pop() || "Payment proof";
  }
}

export default function PaymentDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    apiFetch<{ payment: Payment; client: Client | null }>(
      `/api/payments/${params.id}`,
    )
      .then((data) => {
        if (cancelled) return;
        setPayment(data.payment);
        setClient(data.client);
      })
      .catch((err) => {
        if (cancelled) return;
        setPayment(null);
        setClient(null);
        setError(err instanceof Error ? err.message : "Payment not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const serviceLabel = useMemo(() => {
    if (client?.selectedServices?.length) {
      return client.selectedServices.map((s) => s.title).join(", ");
    }
    return (
      client?.serviceType ||
      (payment
        ? `${payment.servicesCount} ${
            payment.servicesCount === 1 ? "Service" : "Services"
          }`
        : "—")
    );
  }, [client, payment]);

  if (loading) {
    return (
      <p className="text-sm text-gray-400 py-16 text-center">
        Loading payment…
      </p>
    );
  }

  if (error || !payment) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-red-500">{error || "Payment not found"}</p>
        <button
          type="button"
          onClick={() => router.push("/payments")}
          className="text-sm font-medium text-[#2E2A5C] hover:underline"
        >
          Back to payments
        </button>
      </div>
    );
  }

  const since = client ? formatDate(client.createdAt) : formatDate(payment.createdAt);
  const dateTime = `${formatDate(payment.createdAt)} - ${formatTime(payment.createdAt)}`;
  const completed = payment.status === "Completed";

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 sm:px-8 py-7 sm:py-8 space-y-8">
        <button
          type="button"
          onClick={() => router.push("/payments")}
          className="inline-flex items-center text-gray-500 hover:text-gray-800"
          aria-label="Back to payments"
        >
          <BackArrow size={20} />
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
              {payment.paidAmount || payment.amount}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              {payment.servicesCount}{" "}
              {payment.servicesCount === 1 ? "Service" : "Services"} — Client
              since {since}
            </p>
          </div>
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${
              completed
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {completed ? "Completed" : "Not completed"}
          </span>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-5">
            Client Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <Info
              label="Client Name"
              value={client?.name || payment.name}
            />
            <Info
              label="Email Address"
              value={client?.email || "—"}
            />
            <Info
              label="Phone Number"
              value={client?.phone || "—"}
            />
          </div>
        </section>

        <section className="border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">
            Payment Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6 text-sm">
            <Info
              label={`Service (${payment.servicesCount})`}
              value={serviceLabel}
            />
            <Info label="Payment Method" value="Bank Transfer" />
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  completed
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {completed ? "Completed" : "Not completed"}
              </span>
            </div>
            <Info label="Amount" value={payment.amount} />
            <Info label="Paid" value={payment.paidAmount} />
            <Info label="Date & Time" value={dateTime} />
            {payment.paymentPercent ? (
              <Info label="Percent" value={`${payment.paymentPercent}%`} />
            ) : null}
          </div>
        </section>

        <section className="border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Payment proof
          </h2>
          {payment.paymentProofUrl ? (
            <a
              href={payment.paymentProofUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl px-4 py-3.5 hover:border-gray-200"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {fileNameFromUrl(payment.paymentProofUrl)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Uploaded — {formatDate(payment.createdAt)}
                </p>
              </div>
              <ArrowRightIcon size={16} className="text-gray-400 shrink-0" />
            </a>
          ) : (
            <p className="text-sm text-gray-400">No payment proof uploaded.</p>
          )}
        </section>

        {client ? (
          <p className="text-xs text-gray-400">
            View full client profile:{" "}
            <Link
              href={`/clients/${client.id}`}
              className="text-[#2E2A5C] font-medium hover:underline"
            >
              {client.name}
            </Link>
          </p>
        ) : null}
      </div>
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
