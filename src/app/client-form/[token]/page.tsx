"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Check, ChevronDown, CloudUpload, Copy, X } from "lucide-react";
import { apiFetch } from "@/src/lib/api";
import { BANK_DETAILS } from "@/src/lib/bank-details";
import { compressImageForUpload } from "@/src/lib/compress-image";
import { formatNaira } from "@/src/lib/format";
import {
  amountForPercent,
  getServicesByIds,
  SERVICE_CATALOG,
  sumServicePrices,
  type CatalogService,
  type PaymentPercent,
} from "@/src/lib/services-catalog";

async function uploadFormImage(
  token: string,
  file: File,
  kind: "docs" | "proof",
) {
  const compressed = await compressImageForUpload(file);
  const signed = await apiFetch<{
    signedUrl: string;
    publicUrl: string;
  }>(`/api/forms/${token}/upload`, {
    method: "POST",
    body: JSON.stringify({
      fileName: compressed.name,
      contentType: compressed.type,
      kind,
    }),
  });

  const put = await fetch(signed.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": compressed.type || "image/jpeg",
    },
    body: compressed,
  });

  if (!put.ok) {
    throw new Error("Could not upload image. Try a smaller PNG or JPG.");
  }

  return signed.publicUrl;
}

type Step = "form" | "payment" | "done";

type FormClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  formStatus: "pending" | "completed";
};

type LoadResponse = {
  client: FormClient;
  catalog: CatalogService[];
  bank: typeof BANK_DETAILS;
};

const PERCENTS: PaymentPercent[] = [50, 80, 100];

export default function ClientFormPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState<CatalogService[]>(SERVICE_CATALOG);
  const [bank, setBank] = useState(BANK_DETAILS);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("");
  const [about, setAbout] = useState("");
  const [paymentPercent, setPaymentPercent] = useState<PaymentPercent>(100);
  const [servicesOpen, setServicesOpen] = useState(false);

  const [projectDoc, setProjectDoc] = useState<File | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  const projectInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<LoadResponse>(`/api/forms/${token}`);
        if (cancelled) return;
        setCatalog(data.catalog?.length ? data.catalog : SERVICE_CATALOG);
        setBank(data.bank || BANK_DETAILS);
        setName(data.client.name || "");
        setEmail(data.client.email || "");
        setPhone(data.client.phone || "");
        if (data.client.formStatus === "completed") setStep("done");
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

  const selectedServices = useMemo(
    () => getServicesByIds(selectedIds),
    [selectedIds],
  );
  const orderTotal = useMemo(
    () => sumServicePrices(selectedServices),
    [selectedServices],
  );
  const payNow = useMemo(
    () => amountForPercent(orderTotal, paymentPercent),
    [orderTotal, paymentPercent],
  );

  const serviceLabel =
    selectedServices.length === 0
      ? "Select services"
      : selectedServices.map((s) => s.title).join(", ");

  const toggleService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const validateForm = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return "Client name, email, and phone are required.";
    }
    if (selectedIds.length === 0) return "Select at least one service.";
    if (!timeline) return "Choose a project timeline date.";
    if (about.length > 1000) return "About text must be 1000 characters or fewer.";
    return "";
  };

  const goToPayment = (e: FormEvent) => {
    e.preventDefault();
    const msg = validateForm();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setStep("payment");
  };

  const submitPaid = async () => {
    setError("");
    if (!paymentProof) {
      setError("Upload proof of payment before continuing.");
      return;
    }
    setSubmitting(true);
    try {
      const paymentProofUrl = await uploadFormImage(
        token,
        paymentProof,
        "proof",
      );
      const projectDocumentUrl = projectDoc
        ? await uploadFormImage(token, projectDoc, "docs")
        : "";

      await apiFetch(`/api/forms/${token}`, {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          timeline,
          aboutProject: about.trim(),
          paymentPercent,
          serviceIds: selectedIds,
          projectDocumentUrl,
          paymentProofUrl,
        }),
      });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(bank.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#EAE9F0]">
      <header className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-4">
          <Image
            src="/assets/logo.png"
            alt="Netan Technologies"
            width={140}
            height={40}
            priority
            className="object-contain h-9 w-auto"
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-20">Loading…</p>
        ) : error && step === "form" && !name && !email ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-red-500">
            {error}
          </div>
        ) : step === "form" ? (
          <form
            onSubmit={goToPayment}
            className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6 lg:gap-8 items-start"
          >
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-10 space-y-7 min-h-[480px]">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-semibold text-gray-900 tracking-tight">
                  Client Onboarding Form
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Provide your details, select your service, and complete your
                  payment.
                </p>
              </div>

              <Field
                label="Client Name"
                value={name}
                onChange={setName}
                placeholder="Urban opulence"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Example@gmail.com"
                  required
                />
                <Field
                  label="Phone Number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+234 902 323 2356"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Service
                  </label>
                  <button
                    type="button"
                    onClick={() => setServicesOpen((o) => !o)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm border border-gray-200 rounded-xl bg-white hover:border-gray-300"
                  >
                    <span
                      className={`truncate ${
                        selectedServices.length
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {serviceLabel}
                    </span>
                    <ChevronDown size={16} className="text-gray-400 shrink-0" />
                  </button>
                  {servicesOpen ? (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg py-2 max-h-64 overflow-y-auto">
                      {catalog.map((service) => {
                        const checked = selectedIds.includes(service.id);
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => toggleService(service.id)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                          >
                            <span className="text-gray-800">{service.title}</span>
                            <span className="flex items-center gap-2 text-gray-500">
                              {formatNaira(service.price)}
                              <span
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  checked
                                    ? "bg-[#2E2A5C] border-[#2E2A5C] text-white"
                                    : "border-gray-300"
                                }`}
                              >
                                {checked ? <Check size={10} /> : null}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Timeline
                  </label>
                  <input
                    type="date"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#2E2A5C]/50"
                  />
                </div>
              </div>

              <FileDrop
                label="Upload Project Document"
                file={projectDoc}
                inputRef={projectInputRef}
                onPick={setProjectDoc}
                onClear={() => setProjectDoc(null)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Tell us a little about yourself and your project (Optional)
                </label>
                <div className="relative">
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value.slice(0, 1000))}
                    rows={5}
                    className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl outline-none resize-none focus:border-[#2E2A5C]/50"
                  />
                  <span className="absolute bottom-3 right-4 text-xs text-gray-400">
                    {about.length}/1000
                  </span>
                </div>
              </div>

              {error ? (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
                  {error}
                </p>
              ) : null}
            </section>

            <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8 lg:sticky lg:top-8 space-y-6 min-h-[480px] flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h2>

              {selectedServices.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">
                  Select services to see your total.
                </p>
              ) : (
                <ul className="space-y-4">
                  {selectedServices.map((service) => (
                    <li
                      key={service.id}
                      className="flex items-start justify-between gap-4 text-sm"
                    >
                      <span className="text-gray-700 leading-snug">
                        {service.title}
                      </span>
                      <span className="font-medium text-gray-900 shrink-0">
                        {formatNaira(service.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-gray-900">
                  {formatNaira(orderTotal)}
                </span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                A minimum of 50% of the total project cost must be paid before
                work begins. The remaining balance is due upon project
                completion or as agreed.
              </p>

              <div className="space-y-3">
                {PERCENTS.map((percent) => (
                  <label
                    key={percent}
                    className="flex items-center gap-3 cursor-pointer text-sm text-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={paymentPercent === percent}
                      onChange={() => setPaymentPercent(percent)}
                      className="sr-only"
                    />
                    <span
                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                        paymentPercent === percent
                          ? "bg-[#2E2A5C] border-[#2E2A5C] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {paymentPercent === percent ? <Check size={12} /> : null}
                    </span>
                    {percent}%
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="w-full mt-auto py-3.5 rounded-xl bg-[#2E2A5C] text-white text-sm font-medium hover:bg-[#25214a]"
              >
                Checkout
              </button>
            </aside>
          </form>
        ) : step === "payment" ? (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-10 space-y-8 min-h-[480px]">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("form");
                }}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Back"
              >
                ←
              </button>

              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Payment Details
                </h1>
                <div className="mt-4 border-b border-gray-100" />
              </div>

              <dl className="space-y-5 text-sm">
                <Row
                  label="Amount"
                  value={`${formatNaira(payNow)} (${paymentPercent}%)`}
                />
                <Row label="Payment Method" value={bank.paymentMethod} />
                <Row label="Account Name" value={bank.accountName} />
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-gray-900">Account Number</dt>
                  <dd className="text-gray-700 flex items-center gap-2">
                    {bank.accountNumber}
                    <button
                      type="button"
                      onClick={copyAccount}
                      className="text-gray-400 hover:text-[#2E2A5C]"
                      aria-label="Copy account number"
                    >
                      <Copy size={14} />
                    </button>
                    {copied ? (
                      <span className="text-xs text-emerald-600">Copied</span>
                    ) : null}
                  </dd>
                </div>
                <Row label="Bank Name" value={bank.bankName} />
              </dl>

              <div className="space-y-4">
                <p className="text-sm text-gray-800">
                  Please, Upload proof of payment
                </p>
                <FileDrop
                  label=""
                  file={paymentProof}
                  inputRef={proofInputRef}
                  onPick={setPaymentProof}
                  onClear={() => setPaymentProof(null)}
                  required
                />
              </div>

              {error ? (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitPaid()}
                className="w-full py-3.5 rounded-xl bg-[#2E2A5C] text-white text-sm font-medium hover:bg-[#25214a] disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Paid"}
              </button>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[#2E2A5C]/20">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 relative text-center">
              <button
                type="button"
                onClick={() => setStep("done")}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[#2E2A5C] flex items-center justify-center ring-4 ring-[#2E2A5C]/15">
                <Check size={28} className="text-white" strokeWidth={3} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Payment Submitted
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                We&apos;ve received your payment confirmation. Your payment has
                been submitted and is awaiting verification by NetanTech. A
                receipt will be sent to you via email.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E2A5C]/50"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="font-semibold text-gray-900">{label}</dt>
      <dd className="text-gray-700 text-right">{value}</dd>
    </div>
  );
}

function FileDrop({
  label,
  file,
  inputRef,
  onPick,
  onClear,
  required,
}: {
  label: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: (file: File) => void;
  onClear: () => void;
  required?: boolean;
}) {
  const onFile = (picked: File | null | undefined) => {
    if (!picked) return;
    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(picked.type)) {
      return;
    }
    if (picked.size > 5 * 1024 * 1024) return;
    onPick(picked);
  };

  return (
    <div>
      {label ? (
        <label className="block text-sm font-medium text-gray-600 mb-2">
          {label}
        </label>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        required={required && !file}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0]);
        }}
        className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-4 py-10 text-center hover:bg-gray-50"
      >
        <CloudUpload className="mx-auto text-gray-400 mb-3" size={28} />
        {file ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-800 font-medium truncate px-4">
              {file.name}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-xs text-[#2E2A5C] font-medium hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG (max. 5mb)</p>
          </>
        )}
      </button>
    </div>
  );
}
