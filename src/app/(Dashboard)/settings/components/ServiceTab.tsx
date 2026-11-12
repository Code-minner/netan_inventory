"use client";

import { FormEvent, useEffect, useState } from "react";
import Modal from "@/src/components/Modal";
import { EditIcon, PlusIcon } from "@/public/svg/svg";
import { apiFetch } from "@/src/lib/api";
import type { AppSettings } from "@/src/lib/app-settings-shared";
import type { CatalogService } from "@/src/lib/services-catalog";

const inputClass =
  "w-full px-4 py-3 text-sm text-gray-900 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2D266C]/20 focus:border-[#2D266C]/40";

function newServiceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return `svc-${Date.now().toString(36)}`;
}

export default function ServiceTab() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogService | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ settings: AppSettings }>("/api/settings");
        if (!cancelled) setServices(data.settings.services);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load services",
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

  const openAdd = () => {
    setEditing(null);
    setTitle("");
    setPrice("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (service: CatalogService) => {
    setEditing(service);
    setTitle(service.title);
    setPrice(String(service.price));
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const persist = async (next: CatalogService[]) => {
    const data = await apiFetch<{ services: CatalogService[] }>(
      "/api/settings",
      {
        method: "PATCH",
        body: JSON.stringify({ section: "services", services: next }),
      },
    );
    setServices(data.services);
    return data.services;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const trimmed = title.trim();
    const amount = Number(String(price).replace(/[^\d.]/g, ""));
    if (!trimmed) {
      setError("Service name is required.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Enter a valid price.");
      return;
    }

    setSaving(true);
    try {
      let next: CatalogService[];
      if (editing) {
        next = services.map((service) =>
          service.id === editing.id
            ? { ...service, title: trimmed, price: Math.round(amount) }
            : service,
        );
      } else {
        next = [
          ...services,
          {
            id: newServiceId(),
            title: trimmed,
            price: Math.round(amount),
          },
        ];
      }
      await persist(next);
      setMessage(editing ? "Service updated." : "Service added.");
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save service");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading services…</p>;
  }

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-base font-semibold text-gray-900 mb-6">Service</h2>

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

      <div className="space-y-3 mb-5">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4"
          >
            <p className="text-sm font-medium text-gray-900 truncate min-w-0">
              {service.title}
            </p>
            <button
              type="button"
              onClick={() => openEdit(service)}
              aria-label={`Edit ${service.title}`}
              className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <EditIcon size={20} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={openAdd}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#2E2A5C] hover:bg-[#25214a] rounded-lg px-5 py-3"
      >
        <PlusIcon size={18} />
        Add service
      </button>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit service" : "Add service"}
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
              form="service-form"
              disabled={saving}
              className="text-sm font-medium text-white bg-[#2E2A5C] hover:bg-[#25214a] rounded-lg px-5 py-2.5 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <form id="service-form" onSubmit={handleSave} className="space-y-5">
          {error && modalOpen ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}
          <div>
            <label htmlFor="serviceTitle" className="block text-sm text-gray-800 mb-2">
              Service name
            </label>
            <input
              id="serviceTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="UI/UX Design"
              required
            />
          </div>
          <div>
            <label htmlFor="servicePrice" className="block text-sm text-gray-800 mb-2">
              Price (NGN)
            </label>
            <input
              id="servicePrice"
              type="text"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
              placeholder="500000"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
