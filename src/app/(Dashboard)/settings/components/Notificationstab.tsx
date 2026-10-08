"use client";

import { useState } from "react";

const ITEMS = [
  { key: "client", label: "Client" },
  { key: "payment", label: "Payment" },
  { key: "service", label: "Service" },
  { key: "teamActivity", label: "Team Activity" },
  { key: "systemNotice", label: "System Notice" },
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
  const [prefs, setPrefs] = useState<Record<Key, boolean>>({
    client: true,
    payment: true,
    service: true,
    teamActivity: true,
    systemNotice: false,
  });

  const toggle = (key: Key) => {
    // TODO: persist preference to backend
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
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
              checked={prefs[key]}
              onChange={() => toggle(key)}
              label={`${label} notifications`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}