"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { apiFetch } from "@/src/lib/api";
import type { NotificationItem } from "@/src/lib/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
};

export default function NotificationsPanel({
  isOpen,
  onClose,
  onUnreadChange,
}: Props) {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ notifications: NotificationItem[] }>(
        "/api/notifications",
      );
      setItems(data.notifications);
      onUnreadChange?.(data.notifications.filter((n) => n.unread).length);
    } catch {
      setItems([]);
      onUnreadChange?.(0);
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    load();
    return () => cancelAnimationFrame(raf);
  }, [isOpen, load]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const unreadCount = items.filter((i) => i.unread).length;

  const grouped = useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    const filtered =
      tab === "unread" ? items.filter((i) => i.unread) : items;

    for (const item of filtered) {
      const list = map.get(item.dateGroup) || [];
      list.push(item);
      map.set(item.dateGroup, list);
    }

    return Array.from(map.entries()).map(([date, groupItems]) => ({
      date,
      items: groupItems,
    }));
  }, [items, tab]);

  const markAllRead = async () => {
    try {
      const data = await apiFetch<{ notifications: NotificationItem[] }>(
        "/api/notifications",
        {
          method: "PATCH",
          body: JSON.stringify({ markAllRead: true }),
        },
      );
      setItems(data.notifications);
      onUnreadChange?.(0);
    } catch {
      setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
      onUnreadChange?.(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        aria-label="Close notifications"
        onClick={onClose}
      />
      <aside
        className={`absolute top-16 right-4 sm:right-8 w-[min(100%-2rem,380px)] max-h-[min(80vh,560px)] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col transition-all duration-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pb-3">
          <div className="flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`pb-1 border-b-2 ${
                tab === "all"
                  ? "border-[#2E2A5C] text-gray-900 font-medium"
                  : "border-transparent text-gray-400"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTab("unread")}
              className={`pb-1 border-b-2 ${
                tab === "unread"
                  ? "border-[#2E2A5C] text-gray-900 font-medium"
                  : "border-transparent text-gray-400"
              }`}
            >
              Unread({unreadCount})
            </button>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50"
          >
            <Check size={12} />
            Mark all as read
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-10">Loading…</p>
          ) : grouped.every((g) => g.items.length === 0) ? (
            <p className="text-sm text-gray-400 text-center py-10">
              No notifications
            </p>
          ) : (
            grouped.map((group) =>
              group.items.length === 0 ? null : (
                <div key={group.date}>
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400 shrink-0">
                      {group.date}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="divide-y divide-gray-100">
                    {group.items.map((item) => (
                      <div key={item.id} className="py-3.5 relative">
                        {item.unread ? (
                          <span className="absolute left-0 top-5 w-1.5 h-1.5 rounded-full bg-[#2E2A5C]" />
                        ) : null}
                        <p
                          className={`text-sm text-gray-800 leading-snug ${
                            item.unread ? "pl-3" : ""
                          }`}
                        >
                          {item.text}
                        </p>
                        <p
                          className={`text-xs text-gray-400 mt-1.5 ${
                            item.unread ? "pl-3" : ""
                          }`}
                        >
                          {item.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )
          )}
        </div>
      </aside>
    </div>
  );
}
