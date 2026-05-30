"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    axiosInstance
      .get<Conversation[]>("/api/conversations")
      .then((r) => {
        if (cancelled) return;

        const data = Array.isArray(r.data) ? r.data : [];
        setConversations(data);
        setStatus("success");
      })
      .catch((err) => {
        console.error("fetch conversations error", err);

        if (cancelled) return;

        setConversations([]);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const openConversation = async (conv: Conversation) => {
    setSelected(conv);

    if (conv.unread > 0) {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conv._id ? { ...c, unread: 0 } : c
        )
      );

      try {
        await axiosInstance.put(`/api/conversations/${conv._id}/read`);
      } catch (err) {
        console.error("mark conversation as read error", err);

        setConversations((prev) =>
          prev.map((c) =>
            c._id === conv._id ? { ...c, unread: conv.unread } : c
          )
        );
      }
    }
  };

  if (!isOpen) return null;

  if (selected) {
    return (
      <ChatDrawer
        itemId={selected.item._id}
        itemTitle={selected.item.title}
        isOpen={true}
        onClose={() => {
          setSelected(null);
        }}
      />
    );
  }

  const isLoading = status === "idle" && conversations.length === 0;
  const isEmpty = status === "success" && conversations.length === 0;
  const hasError = status === "error";

  return (
    <div className="fixed inset-0 z-110" dir="rtl">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="fixed top-0 right-0 left-auto z-111 h-dvh w-full max-w-md border-l border-gray-100 bg-white shadow-2xl flex flex-col">
        <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-black text-gray-800">الرسائل</h2>
              <p className="mt-0.5 text-xs text-gray-400">
                جميع المحادثات الخاصة بك
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100"
              aria-label="إغلاق"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">
                close
              </span>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-3"
                >
                  <div className="h-11 w-11 shrink-0 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
                    <div className="h-2 w-1/2 rounded bg-gray-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-gray-400">
              <span className="material-symbols-outlined text-5xl text-red-400">
                error_outline
              </span>
              <p className="text-sm font-bold text-gray-600">
                تعذر تحميل المحادثات
              </p>
              <p className="max-w-55 text-xs leading-6 text-gray-400">
                حدث خطأ أثناء جلب البيانات، حاول مرة أخرى لاحقًا
              </p>
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-gray-400">
              <span className="material-symbols-outlined text-5xl">
                chat_bubble_outline
              </span>
              <p className="text-sm font-bold text-gray-600">
                لا توجد محادثات بعد
              </p>
              <p className="max-w-55 text-xs leading-6 text-gray-400">
                عند حجز أي غرض أو بدء محادثة جديدة ستظهر هنا مباشرة
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {conversations.map((conv) => {
                const other = conv.participants.find(
                  (p) => p._id !== user?._id
                );

                return (
                  <button
                    key={conv._id}
                    onClick={() => openConversation(conv)}
                    className="w-full rounded-2xl border border-gray-100 bg-white px-3 py-3 text-right shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                        {other?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={other.avatar}
                            alt={other?.name || "مستخدم"}
                            className="h-full w-full object-cover"
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
                          <p className="truncate text-sm font-black text-gray-800">
                            {conv.item.title}
                          </p>

                          {conv.unread > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black text-white">
                              {conv.unread > 9 ? "9+" : conv.unread}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {other?.name || "مستخدم"}
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