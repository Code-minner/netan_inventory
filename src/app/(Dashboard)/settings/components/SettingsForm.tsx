"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import ProfileTab from "./Profiletab";
import PasswordTab from "./Passwordtab";
import NotificationsTab from "./Notificationstab";
import GeneralSettingsTab from "./GeneralSettingsTab";
import ServiceTab from "./ServiceTab";
import PaymentOptionTab from "./PaymentOptionTab";

const BASE_TABS = [
  { id: "profile", label: "Profile" },
  { id: "password", label: "Change password" },
  { id: "notifications", label: "Notification" },
] as const;

const SUPERADMIN_TABS = [
  { id: "profile", label: "Profile" },
  { id: "password", label: "Change password" },
  { id: "general", label: "General Settings" },
  { id: "service", label: "Service" },
  { id: "payment", label: "Payment option" },
  { id: "notifications", label: "Notification" },
] as const;

type TabId =
  | (typeof BASE_TABS)[number]["id"]
  | (typeof SUPERADMIN_TABS)[number]["id"];

export default function SettingsForm() {
  const { isSuperadmin, loading } = useAuth();
  const tabs = useMemo(
    () => (isSuperadmin ? SUPERADMIN_TABS : BASE_TABS),
    [isSuperadmin],
  );
  const [active, setActive] = useState<TabId>("profile");

  const wideContent =
    active === "general" || active === "service" || active === "payment";

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 min-h-[560px]">
        <p className="text-sm text-gray-500">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 lg:p-10 min-h-[560px] flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16">
      <nav
        aria-label="Settings sections"
        className="flex md:flex-col gap-1 md:w-44 shrink-0 overflow-x-auto"
      >
        {tabs.map((tab) => {
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

      <div className={`flex-1 min-w-0 ${wideContent ? "" : "max-w-2xl"}`}>
        {active === "profile" && <ProfileTab />}
        {active === "password" && <PasswordTab />}
        {active === "general" && isSuperadmin && <GeneralSettingsTab />}
        {active === "service" && isSuperadmin && <ServiceTab />}
        {active === "payment" && isSuperadmin && <PaymentOptionTab />}
        {active === "notifications" && <NotificationsTab />}
      </div>
    </div>
  );
}
