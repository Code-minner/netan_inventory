"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MessageIcon } from "../../../../../public/svg/svg";
import { useSearchParams } from "next/navigation";
import {
  CURRENT_ADMIN,
  MOCK_CONVERSATIONS,
  type ChatMessage,
  type Conversation,
} from "@/src/lib/mock-data";
import { formatDate } from "@/src/lib/format";

export default function MessagesInbox() {
  const searchParams = useSearchParams();
  const deepLinkCustomer = searchParams.get("customer");
  const deepLinkHandled = useRef<string | null>(null);
  const [items, setItems] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(q) ||
        item.whatsappNumber.toLowerCase().includes(q),
    );
  }, [items, query]);

  const thread = items.find((item) => item.customerId === selectedId) ?? null;

  const scrollToLatest = useCallback((behavior: ScrollBehavior = "auto") => {
    requestAnimationFrame(() => {
      threadEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }, []);

  useEffect(() => {
    if (!deepLinkCustomer) return;
    if (deepLinkHandled.current === deepLinkCustomer) return;
    deepLinkHandled.current = deepLinkCustomer;
    setSelectedId(deepLinkCustomer);
  }, [deepLinkCustomer]);

  useEffect(() => {
    if (!thread?.messages.length) return;
    scrollToLatest("auto");
  }, [thread?.customerId, thread?.messages.length, scrollToLatest]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  const handleTakeover = () => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.customerId === selectedId
          ? {
              ...item,
              mode: "human",
              assignedAdmin: {
                id: CURRENT_ADMIN.id,
                name: CURRENT_ADMIN.name,
                email: CURRENT_ADMIN.email,
              },
            }
          : item,
      ),
    );
  };

  const handleRelease = () => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.customerId === selectedId
          ? { ...item, mode: "bot", assignedAdmin: null }
          : item,
      ),
    );
  };

  const handleReply = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || !reply.trim()) return;
    const text = reply.trim();
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      body: text,
      direction: "outbound",
      createdAt: new Date().toISOString(),
      whatsappMessageId: null,
    };
    setReply("");
    setItems((prev) =>
      prev.map((item) =>
        item.customerId === selectedId
          ? {
              ...item,
              mode: "human",
              assignedAdmin: item.assignedAdmin ?? {
                id: CURRENT_ADMIN.id,
                name: CURRENT_ADMIN.name,
                email: CURRENT_ADMIN.email,
              },
              lastMessage: message,
              updatedAt: message.createdAt,
              messages: [...item.messages, message],
            }
          : item,
      ),
    );
    scrollToLatest("smooth");
  };

  const isHuman = thread?.mode === "human";
  const showThread = Boolean(selectedId);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden min-w-0">
      <div className="mb-4 flex items-start justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Take over chats from the bot and reply as support
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-[300px_1fr] flex-1 min-h-0 min-w-0">
        <div
          className={`border-r border-gray-100 flex-col min-h-0 min-w-0 ${
            showThread ? "hidden lg:flex" : "flex"
          }`}
        >
          <form
            onSubmit={handleSearch}
            className="p-3 border-b border-gray-100 shrink-0"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </form>
          <div className="flex-1 overflow-y-auto min-h-0">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No messages yet.</p>
            ) : (
              filtered.map((item) => {
                const active = item.customerId === selectedId;
                return (
                  <button
                    key={item.customerId}
                    type="button"
                    onClick={() => setSelectedId(item.customerId)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${
                      active ? "bg-green-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name || item.whatsappNumber}
                      </p>
                      <span
                        className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          item.mode === "human"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.mode === "human" ? "Human" : "Bot"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {item.lastMessage?.body || "No messages"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {item.lastMessage
                        ? formatDate(item.lastMessage.createdAt)
                        : formatDate(item.updatedAt)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div
          className={`flex-col min-h-0 min-w-0 ${
            showThread ? "flex" : "hidden lg:flex"
          }`}
        >
          {!selectedId || !thread ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 p-8">
              <MessageIcon size={28} />
              <p className="text-sm text-center">
                Select a chat to view messages
              </p>
            </div>
          ) : (
            <>
              <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between shrink-0">
                <div className="min-w-0 flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="lg:hidden shrink-0 text-sm text-[#2D266C] font-medium px-2 py-1 -ml-1 rounded-lg hover:bg-green-50"
                  >
                    ← Back
                  </button>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {thread.name || thread.whatsappNumber}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {thread.whatsappNumber}
                      {thread.assignedAdmin
                        ? ` · Assigned to ${thread.assignedAdmin.name || thread.assignedAdmin.email}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
                  {isHuman ? (
                    <button
                      type="button"
                      onClick={handleRelease}
                      className="flex-1 sm:flex-none text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Release to bot
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTakeover}
                      className="flex-1 sm:flex-none text-xs font-medium px-3 py-2 rounded-lg bg-green-800 text-white hover:bg-green-900"
                    >
                      Take over
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 space-y-3 bg-gray-50/50">
                {thread.messages.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No messages in this thread.
                  </p>
                ) : (
                  thread.messages.map((msg) => {
                    const inbound = msg.direction === "inbound";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${inbound ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-3.5 py-2 text-sm ${
                            inbound
                              ? "bg-white border border-gray-100 text-gray-800"
                              : "bg-[#2D266C] text-white"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {msg.body}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${
                              inbound ? "text-gray-400" : "text-white/70"
                            }`}
                          >
                            {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={threadEndRef} />
              </div>

              <form
                onSubmit={handleReply}
                className="p-3 sm:p-4 border-t border-gray-100 shrink-0 bg-white"
              >
                {!isHuman ? (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                    Bot is active. Sending a reply will take over this chat and
                    pause the bot.
                  </p>
                ) : null}
                <div className="flex gap-2 min-w-0">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply…"
                    className="flex-1 min-w-0 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="shrink-0 text-sm font-medium text-white bg-green-800 hover:bg-green-900 disabled:opacity-50 rounded-lg px-4 py-2.5"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
