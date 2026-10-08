"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BellIcon, MenuIcon } from "../../public/svg/svg";
import { useSidebar } from "./SidebarContext";
import { CURRENT_ADMIN } from "@/src/lib/mock-data";
import NotificationsPanel from "./NotificationsPanel";

const titles: Record<string, string> = {
  "/home": "Dashboard",
  "/clients": "Clients",
  "/payments": "Payments",
  "/reports": "Reports",
  "/team": "Team",
  "/settings": "Settings",
};

export default function Header() {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const title = titles[pathname] ?? "";
  const admin = CURRENT_ADMIN;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const displayName = admin.name?.trim() || admin.email.split("@")[0];
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={toggle} className="lg:hidden text-black shrink-0">
            <MenuIcon size={22} />
          </button>
          <h2 className="text-lg sm:text-xl font-semibold text-black truncate">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="relative w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 hover:bg-gray-50"
            aria-label="Open notifications"
          >
            <BellIcon size={16} />
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>

          <div className="flex items-center gap-2 pl-1">
            <div className="w-9 h-9 rounded-full bg-[#E6EDE8] text-[#2D266C] flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden relative">
              {admin.avatarUrl ? (
                <Image
                  src={admin.avatarUrl}
                  alt={displayName}
                  fill
                  sizes="36px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                initials || "A"
              )}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[140px]">
                {admin.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}
