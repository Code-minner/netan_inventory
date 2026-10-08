"use client";

import { useState } from "react";
import ProfileTab from "./Profiletab";
import PasswordTab from "./Passwordtab";
import NotificationsTab from "./Notificationstab";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "password", label: "Change password" },
  { id: "notifications", label: "Notification" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsForm() {
  const [active, setActive] = useState<TabId>("profile");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 min-h-[480px] flex flex-col md:flex-row gap-6 md:gap-10">
        <nav
          aria-label="Settings sections"
          className="flex md:flex-col gap-1 md:w-52 shrink-0 overflow-x-auto"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={`text-left text-sm whitespace-nowrap rounded-lg px-4 py-2.5 transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

      <div className="flex-1 min-w-0">
        {active === "profile" && <ProfileTab />}
        {active === "password" && <PasswordTab />}
        {active === "notifications" && <NotificationsTab />}
      </div>
    </div>
  );
}