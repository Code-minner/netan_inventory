"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BellIcon, MenuIcon } from "../../public/svg/svg";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "./AuthProvider";
import NotificationsPanel from "./NotificationsPanel";
import { apiFetch } from "@/src/lib/api";
import type { NotificationItem } from "@/src/lib/types";

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
  const { admin } = useAuth();
  const title = titles[pathname] ?? "";
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const displayName = admin?.name?.trim() || admin?.email?.split("@")[0] || "Staff";
  const initials = admin?.initials || "NA";

  const refreshUnread = useCallback(async () => {
    try {
      const data = await apiFetch<{ notifications: NotificationItem[] }>(
        "/api/notifications",
      );
      setUnreadCount(data.notifications.filter((n) => n.unread).length);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread, pathname]);

  return (
    <>
      <header className="flex items-center justify-between px-5 sm:px-10 lg:px-12 py-5 bg-white border-b border-gray-100">
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
            aria-label={
              unreadCount > 0
                ? `Open notifications, ${unreadCount} unread`
                : "Open notifications"
            }
          >
            <BellIcon size={16} />
            {unreadCount > 0 ? (
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
            ) : null}
          </button>

          <div className="flex items-center gap-2 pl-1">
            <div className="w-9 h-9 rounded-full bg-[#E6EDE8] text-[#2D266C] flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden relative">
              {admin?.avatarUrl ? (
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
                {admin?.email || ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          void refreshUnread();
        }}
        onUnreadChange={setUnreadCount}
      />
    </>
  );
}
