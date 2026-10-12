"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import { useAuth, type SessionAdmin } from "@/src/components/AuthProvider";

const inputClass =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D266C]/20 focus:border-[#2D266C]/40";

export default function ProfileTab() {
  const { admin, setAdmin } = useAuth();
  const parts = (admin?.name || "").trim().split(/\s+/).filter(Boolean);
  const [firstName, setFirstName] = useState(parts[0] || "");
  const [lastName, setLastName] = useState(parts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!admin) return;
    const nextParts = admin.name.trim().split(/\s+/).filter(Boolean);
    setFirstName(nextParts[0] || "");
    setLastName(nextParts.slice(1).join(" ") || "");
    setEmail(admin.email);
  }, [admin]);

  const initials = admin?.initials || "A";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      const data = await apiFetch<{ admin: SessionAdmin }>("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      setAdmin(data.admin);
      setMessage("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <h2 className="text-base font-semibold text-gray-900 mb-5">Profile</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#FDE8D7] flex items-center justify-center">
          <span className="text-lg font-semibold text-[#2D266C]">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{admin?.role || "Staff"}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Email stays tied to your login and can&apos;t be changed here.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          {message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label htmlFor="firstName" className="block text-sm text-gray-700 mb-1.5">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm text-gray-700 mb-1.5">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="email" className="block text-sm text-gray-700 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className={`${inputClass} bg-gray-50`}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="text-sm font-medium text-white bg-[#2D266C] hover:bg-[#241f58] rounded-lg px-4 py-2.5 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
