"use client";

import { apiFetch } from "@/src/lib/api";
import { useAuth, type SessionAdmin } from "@/src/components/AuthProvider";

const ITEMS = [
  { key: "notifyClient", label: "Client" },
  { key: "notifyPayment", label: "Payment" },
  { key: "notifyService", label: "Service" },
  { key: "notifyTeam", label: "Team Activity" },
  { key: "notifySystem", label: "System Notice" },
] as const;

type Key = (typeof ITEMS)[number]["key"];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D266C]/30 ${
        checked ? "bg-[#2D266C]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

export default function NotificationsTab() {
  const { admin, setAdmin } = useAuth();

  const toggle = async (key: Key) => {
    if (!admin) return;
    const next = { [key]: !admin[key] };
    try {
      const data = await apiFetch<{ admin: SessionAdmin }>("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(next),
      });
      setAdmin(data.admin);
    } catch {
      // keep previous prefs
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-base font-semibold text-gray-900 mb-5">
        Notifications
      </h2>
      <ul className="space-y-4">
        {ITEMS.map(({ key, label }) => (
          <li key={key} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{label}</span>
            <Toggle
              checked={Boolean(admin?.[key])}
              onChange={() => toggle(key)}
              label={`${label} notifications`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
