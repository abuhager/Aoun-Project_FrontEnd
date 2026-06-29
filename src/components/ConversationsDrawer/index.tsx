"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/api/axiosInstance";
import ChatDrawer from "@/components/ChatDrawer";

interface ConversationItem {
  _id: string;
  title: string;
  imageUrl?: string;
}

interface Participant {
  _id: string;
  name: string;
  avatar?: string;
}

interface Conversation {
  _id: string;
  item: ConversationItem;
  participants: Participant[];
  unread: number;
  lastActivity: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

type FetchStatus = "idle" | "success" | "error";

export default function ConversationsDrawer({
  isOpen,
  onClose,
  onUnreadCountChange,
}: Props) {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [status, setStatus] = useState<FetchStatus>("idle");

  const unreadTotal = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + (conv.unread || 0), 0);
  }, [conversations]);

  useEffect(() => {
    onUnreadCountChange?.(unreadTotal);
  }, [unreadTotal, onUnreadCountChange]);

  const fetchConversations = useCallback((cancelledRef = { current: false }) => {
    axiosInstance
      .get<Conversation[]>("/api/conversations")
      .then((r) => {
        if (cancelledRef.current) return;

        const rawData =
          r.data && typeof r.data === "object" && "data" in r.data
            ? (r.data as Record<string, unknown>).data
            : r.data;

        const data = Array.isArray(rawData) ? rawData : [];
        setConversations(data);
        setStatus("success");
      })
      .catch((err) => {
        console.error("fetch conversations error", err);
        if (cancelledRef.current) return;
        setConversations([]);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const cancelledRef = { current: false };
    fetchConversations(cancelledRef);

    return () => {
      cancelledRef.current = true;
    };
  }, [isOpen, fetchConversations]);

  const openConversation = async (conv: Conversation) => {
    setSelected(conv);

    if (conv.unread > 0) {
      setConversations((prev) =>
        prev.map((c) => (c._id === conv._id ? { ...c, unread: 0 } : c))
      );

      try {
        await axiosInstance.put(`/api/conversations/${conv._id}/read`);
      } catch (err) {
        console.error("mark conversation as read error", err);
        setConversations((prev) =>
          prev.map((c) => (c._id === conv._id ? { ...c, unread: conv.unread } : c))
        );
      }
    }
  };

  if (!isOpen) return null;

  if (selected) {
  return (
    <ChatDrawer
      // نضمن قراءة الـ _id بشكل صحيح وآمن
      itemId={selected.item?._id || ""}
      itemTitle={selected.item?.title || "غرض غير متاح"}
      isOpen={true}
      onClose={() => {
        setSelected(null);
        fetchConversations();
      }}
    />
  );
}

  const isLoading = status === "idle" && conversations.length === 0;
  const isEmpty = status === "success" && conversations.length === 0;
  const hasError = status === "error";

  return (
    <div className="fixed inset-0 z-[110]" dir="rtl">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#0f1720]/45 backdrop-blur-[3px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-[111] flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-black/[0.06] bg-[#fcfbf8] shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
        {/* Header */}
        <div className="relative shrink-0 border-b border-[#ece7de] bg-white/95 px-4 py-4 backdrop-blur-xl">
          <div className="absolute left-0 top-0 h-24 w-24 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1 rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 text-[10px] font-black text-primary">
                <span className="material-symbols-outlined text-[13px]">mail</span>
                صندوق المحادثات
              </div>

              <h2 className="text-base font-black text-[#1c2324]">الرسائل</h2>
              <p className="mt-0.5 text-xs font-semibold text-[#8b847c]">
                جميع المحادثات الخاصة بك
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadTotal > 0 && (
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-[11px] font-black text-white shadow-sm">
                  {unreadTotal > 99 ? "99+" : unreadTotal}
                </span>
              )}

              <button
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[#6f6a63] transition-all duration-300 hover:bg-[#f2eee8] hover:text-[#1f2526]"
                aria-label="إغلاق"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f7f5f0_0%,#f8f6f2_100%)]">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[22px] border border-[#ece7de] bg-white px-3 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[#ebe5dd]" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#e7e1d9]" />
                      <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-[#f2ede6]" />
                    </div>
                    <div className="h-5 w-8 animate-pulse rounded-full bg-[#e8f5f3]" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasError ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-400 shadow-sm">
                <span className="material-symbols-outlined text-3xl">error_outline</span>
              </div>
              <p className="mt-4 text-sm font-black text-[#243132]">
                تعذر تحميل المحادثات
              </p>
              <p className="mt-2 max-w-[18rem] text-xs leading-6 text-[#8a837b]">
                حدث خطأ أثناء جلب البيانات، حاول مرة أخرى بعد قليل.
              </p>
              <button
                onClick={() => fetchConversations()}
                type="button"
                className="mt-4 rounded-2xl bg-primary px-5 py-2.5 text-xs font-black text-white transition-all hover:bg-primary/90"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm">
                <span className="material-symbols-outlined text-3xl">
                  chat_bubble_outline
                </span>
              </div>
              <p className="mt-4 text-sm font-black text-[#243132]">
                لا توجد محادثات بعد
              </p>
              <p className="mt-2 max-w-[18rem] text-xs leading-6 text-[#8a837b]">
                عند حجز أي غرض أو بدء محادثة جديدة ستظهر هنا مباشرة.
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {conversations.map((conv) => {
                const other = conv.participants.find((p) => p._id !== user?._id);
                const hasUnread = conv.unread > 0;

                return (
                  <button
                    key={conv._id}
                    onClick={() => openConversation(conv)}
                    className={`group w-full rounded-[22px] border px-3 py-3 text-right shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                      hasUnread
                        ? "border-primary/15 bg-[#f8fffd]"
                        : "border-[#ece7de] bg-white hover:bg-[#fcfbf8]"
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-1 ring-black/[0.04]">
                        {other?.avatar ? (
                          <Image
                            src={other.avatar}
                            alt={other?.name || "مستخدم"}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span
                            className="material-symbols-outlined text-[24px] text-primary"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            account_circle
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-sm font-black ${
                              hasUnread ? "text-[#163637]" : "text-[#1c2324]"
                            }`}
                          >
                            {conv.item?.title || "غرض محذوف"}
                          </p>

                          {conv.unread > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black text-white">
                              {conv.unread > 9 ? "9+" : conv.unread}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <p
                            className={`truncate text-xs ${
                              hasUnread ? "font-bold text-[#5f6d67]" : "text-[#9b948c]"
                            }`}
                          >
                            {other?.name || "مستخدم عون"}
                          </p>

                          {hasUnread && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>

                        <p className="mt-1 text-[10px] font-semibold text-[#b0a89f]">
                          {new Date(conv.lastActivity).toLocaleDateString("ar-JO", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}