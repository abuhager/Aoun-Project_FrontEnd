"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import axiosInstance from "@/lib/api/axiosInstance";
import ChatDrawer from "@/components/ChatDrawer";

interface ConversationItem {
  _id: string;
  title: string;
  imageUrl?: string;
  images?: string[];
}

interface Participant {
  _id: string;
  name: string;
  avatar?: string;
}

interface Conversation {
  _id: string;
  item?: ConversationItem | null;
  participants?: Participant[];
  owner?: Participant | null;
  requester?: Participant | null;
  unreadCount?: number;
  lastActivity?: string;
  lastMessage?: { text?: string } | string | null;
  lastMessageAt?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

type Status = "idle" | "loading" | "success" | "error";

export default function ConversationsDrawer({
  isOpen,
  onClose,
  onUnreadCountChange,
}: Props) {
  const { user } = useAuth();
  const socketRef = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations]
  );

  useEffect(() => {
    onUnreadCountChange?.(unreadTotal);
  }, [unreadTotal, onUnreadCountChange]);

  const fetchConversations = useCallback(() => {
    setStatus("loading");

    axiosInstance
      .get("/api/conversations")
      .then((r) => {
        const payload = r.data as { data?: Conversation[] } | Conversation[];
        const raw = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        setConversations(raw);
        setStatus("success");
      })
      .catch((error) => {
        console.error("[ConversationsDrawer] fetchConversations error:", error);
        setConversations([]);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    if (isOpen) fetchConversations();
  }, [isOpen, fetchConversations]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onNewConversation = () => fetchConversations();
    const onNewMessage = () => fetchConversations();
    const onMessagesRead = () => fetchConversations();

    s.on("newConversation", onNewConversation);
    s.on("newMessage", onNewMessage);
    s.on("message:new", onNewMessage);
    s.on("messagesRead", onMessagesRead);

    return () => {
      s.off("newConversation", onNewConversation);
      s.off("newMessage", onNewMessage);
      s.off("message:new", onNewMessage);
      s.off("messagesRead", onMessagesRead);
    };
  }, [socketRef, fetchConversations]);

  const openConversation = useCallback(async (conv: Conversation) => {
    setSelected(conv);

    if ((conv.unreadCount || 0) > 0) {
      setConversations((prev) =>
        prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
      );

      try {
        await axiosInstance.put(`/api/conversations/${conv._id}/read`);
      } catch (error) {
        console.error("[ConversationsDrawer] mark read error:", error);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conv._id ? { ...c, unreadCount: conv.unreadCount || 0 } : c
          )
        );
      }
    }
  }, []);

  if (selected) {
    return (
      <ChatDrawer
        itemId={selected.item?._id ?? ""}
        itemTitle={selected.item?.title ?? "محادثة"}
        isOpen={true}
        onClose={() => {
          setSelected(null);
          fetchConversations();
        }}
      />
    );
  }

  if (!isOpen) return null;

  const isLoading = status === "loading" || status === "idle";
  const isEmpty = status === "success" && conversations.length === 0;
  const hasError = status === "error";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">المحادثات</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 transition-colors hover:text-gray-700"
            type="button"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex h-32 items-center justify-center text-gray-400">
              جاري التحميل...
            </div>
          )}

          {hasError && (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-red-500">
              <span>حدث خطأ في التحميل</span>
              <button onClick={fetchConversations} className="text-sm underline" type="button">
                إعادة المحاولة
              </button>
            </div>
          )}

          {isEmpty && (
            <div className="flex h-32 items-center justify-center text-gray-400">
              لا توجد محادثات بعد
            </div>
          )}

          {!isLoading &&
            conversations.map((conv) => {
              const fallbackParticipants = conv.participants ?? [];
              const otherFromParticipants =
                fallbackParticipants.find((p) => p._id !== user?._id) ?? null;

              const other =
                otherFromParticipants ||
                (conv.owner?._id !== user?._id ? conv.owner : null) ||
                (conv.requester?._id !== user?._id ? conv.requester : null) ||
                null;

              const lastMessageText =
                typeof conv.lastMessage === "string"
                  ? conv.lastMessage
                  : conv.lastMessage?.text ?? "";

              const avatarSrc =
                other?.avatar ||
                conv.item?.imageUrl ||
                conv.item?.images?.[0] ||
                "";

              return (
                <button
                  key={conv._id}
                  onClick={() => openConversation(conv)}
                  className="flex w-full items-center gap-3 border-b px-4 py-3 text-right transition-colors hover:bg-gray-50"
                  type="button"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={other?.name ?? conv.item?.title ?? "محادثة"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-500">
                        {other?.name?.[0] ?? "؟"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-gray-800">
                        {other?.name ?? "مستخدم"}
                      </span>

                      {(conv.unreadCount || 0) > 0 && (
                        <span className="mr-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-xs text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <span className="truncate text-sm text-gray-400">
                      {conv.item?.title ?? "غرض"}
                    </span>

                    {!!lastMessageText && (
                      <span className="mt-0.5 truncate text-xs text-gray-400">
                        {lastMessageText}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}