"use client";

import { FormEvent, useEffect, useState } from "react";
import Modal from "@/src/components/Modal";
import { EditIcon } from "@/public/svg/svg";
import { apiFetch } from "@/src/lib/api";
import {
  DEFAULT_BANK,
  type AppSettings,
  type BankSettings,
} from "@/src/lib/app-settings-shared";

const inputClass =
  "w-full px-4 py-3 text-sm text-gray-900 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2D266C]/20 focus:border-[#2D266C]/40";

export default function PaymentOptionTab() {
  const [bank, setBank] = useState<BankSettings>(DEFAULT_BANK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ settings: AppSettings }>("/api/settings");
        if (!cancelled) setBank(data.settings.bank);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load bank details",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openEdit = () => {
    setBankName(bank.bankName);
    setAccountName(bank.accountName);
    setAccountNumber(bank.accountNumber);
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const data = await apiFetch<{ bank: BankSettings }>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({
          section: "bank",
          paymentMethod: bank.paymentMethod || "Bank Transfer",
          bankName: bankName.trim(),
          accountName: accountName.trim(),
          accountNumber: accountNumber.trim(),
        }),
      });
      setBank(data.bank);
      setMessage("Payment details updated.");
      setModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save payment details",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading payment options…</p>;
  }

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-base font-semibold text-gray-900 mb-6">
        Payment Option
      </h2>

      {error && !modalOpen ? (
        <p className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-5 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          {message}
        </p>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <h3 className="text-sm font-semibold text-gray-900">
            {bank.paymentMethod || "Bank Transfer"}
          </h3>
          <button
            type="button"
            onClick={openEdit}
            aria-label="Edit bank details"
            className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-gray-50"
          >
            <EditIcon size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Bank Name</p>
            <p className="text-sm font-medium text-gray-900">{bank.bankName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Account Name</p>
            <p className="text-sm font-medium text-gray-900">
              {bank.accountName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Account Number</p>
            <p className="text-sm font-medium text-gray-900">
              {bank.accountNumber}
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Edit bank details"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="bank-form"
              disabled={saving}
              className="text-sm font-medium text-white bg-[#2E2A5C] hover:bg-[#25214a] rounded-lg px-5 py-2.5 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <form id="bank-form" onSubmit={handleSave} className="space-y-5">
          {error && modalOpen ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}
          <div>
            <label htmlFor="bankName" className="block text-sm text-gray-800 mb-2">
              Bank Name
            </label>
            <input
              id="bankName"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label
              htmlFor="accountName"
              className="block text-sm text-gray-800 mb-2"
            >
              Account Name
            </label>
            <input
              id="accountName"
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label
              htmlFor="accountNumber"
              className="block text-sm text-gray-800 mb-2"
            >
              Account Number
            </label>
            <input
              id="accountNumber"
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
