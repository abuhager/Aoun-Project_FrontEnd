"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { SOCKET_EVENTS } from "@/config/socket";
import { ChatPanel } from "@/components/ChatDrawer";
import AccessibleDialog from "@/components/ui/AccessibleDialog";
import { listConversations, markConversationRead } from "@/lib/api/conversationApi";
import type { ChatParticipant, ConversationListItem } from "@/types/chat.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
  initialConversationId?: string | null;
}

function getAvatarBgColor(name: string): { bg: string; text: string } {
  const charCode = name.charCodeAt(0) || 0;
  const colors = [
    { bg: "bg-teal-50", text: "text-teal-700" },
    { bg: "bg-emerald-50", text: "text-emerald-700" },
    { bg: "bg-amber-50", text: "text-amber-700" },
    { bg: "bg-sky-50", text: "text-sky-700" },
    { bg: "bg-indigo-50", text: "text-indigo-700" },
    { bg: "bg-rose-50", text: "text-rose-700" },
  ];
  return colors[charCode % colors.length];
}

function formatTimestamp(dateStr?: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("ar-JO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "أمس";

  return date.toLocaleDateString("ar-JO", { month: "short", day: "numeric" });
}

function getOtherParticipant(
  conversation: ConversationListItem,
  userId?: string
): ChatParticipant | null {
  return conversation.participants?.find((participant) => participant._id !== userId)
    || conversation.owner
    || conversation.requester
    || null;
}

export default function ConversationList({
  isOpen,
  onClose,
  onUnreadCountChange,
  initialConversationId = null,
}: Props) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId);
  const [search, setSearch] = useState("");

  const {
    data: conversations = [],
    error: conversationsError,
    isLoading,
    mutate,
  } = useSWR<ConversationListItem[]>(
    isOpen ? "/api/conversations" : null,
    () => listConversations(),
    { revalidateOnFocus: true }
  );

  const selected = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedId) || null,
    [conversations, selectedId]
  );

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0),
    [conversations]
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const other = getOtherParticipant(conversation, user?._id);
      return [conversation.item?.title, other?.name, conversation.lastMessage]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase("ar").includes(query));
    });
  }, [conversations, search, user?._id]);

  useEffect(() => {
    onUnreadCountChange?.(unreadTotal);
  }, [onUnreadCountChange, unreadTotal]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => void mutate();
    const resyncAfterReconnect = () => {
      if (!socket.recovered) refresh();
    };

    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, refresh);
    socket.on(SOCKET_EVENTS.NEW_CONVERSATION, refresh);
    socket.on(SOCKET_EVENTS.MESSAGES_READ, refresh);
    socket.on("connect", resyncAfterReconnect);

    return () => {
      socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED, refresh);
      socket.off(SOCKET_EVENTS.NEW_CONVERSATION, refresh);
      socket.off(SOCKET_EVENTS.MESSAGES_READ, refresh);
      socket.off("connect", resyncAfterReconnect);
    };
  }, [mutate, socket]);

  const openConversation = useCallback(async (conversation: ConversationListItem) => {
    const secureId = conversation._id;
    if (!secureId) return;

    setSelectedId(secureId);

    if ((conversation.unreadCount || 0) > 0) {
      const snapshot = conversations;
      await mutate(
        (current) => current?.map((item) => (
          item._id === secureId ? { ...item, unreadCount: 0 } : item
        )),
        { revalidate: false }
      );

      try {
        await markConversationRead(secureId);
      } catch {
        await mutate(snapshot, { revalidate: true });
      }
    }
  }, [conversations, mutate]);

  const returnToInbox = useCallback(() => {
    setSelectedId(null);
    void mutate();
  }, [mutate]);

  if (!isOpen) return null;

  const missingRequestedConversation = Boolean(
    !isLoading && selectedId && !selected && !conversationsError
  );
  const selectedParticipant = selected
    ? getOtherParticipant(selected, user?._id)
    : null;

  return (
    <AccessibleDialog
      ariaLabel="مركز الرسائل"
      onClose={onClose}
      overlayClassName="fixed inset-0 z-[110] flex items-center justify-center bg-[#071d21]/65 p-0 backdrop-blur-sm md:p-4"
      panelClassName="relative h-dvh w-full overflow-hidden bg-white shadow-2xl md:h-[min(760px,calc(100dvh-2rem))] md:max-w-[1180px] md:rounded-2xl md:border md:border-white/20"
    >
      <div dir="ltr" className="grid h-full min-h-0 bg-white lg:grid-cols-[minmax(0,1fr)_340px]">
        <aside
          dir="rtl"
          className={`${selected ? "hidden lg:flex" : "flex"} min-h-0 flex-col border-black/[0.08] bg-white lg:col-start-2 lg:row-start-1 lg:border-r-0 lg:border-l`}
          aria-label="قائمة المحادثات"
        >
          <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-black/[0.08] bg-white px-4 sm:px-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-on-surface">الرسائل</h2>
                  {unreadTotal > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-primary px-1.5 text-[9px] font-black text-white">
                      {unreadTotal > 99 ? "+99" : unreadTotal}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10px] font-bold text-on-surface-soft">
                  {conversations.length} محادثة
                </p>
              </div>
              {!selected && (
                <button
                  type="button"
                  aria-label="إغلاق الرسائل"
                  onClick={onClose}
                  className="touch-target -ml-2 flex shrink-0 items-center justify-center rounded-lg text-on-surface-soft hover:bg-surface-container-low hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[21px]">close</span>
                </button>
              )}
          </header>

          <div className="shrink-0 border-b border-black/[0.06] bg-[#f8faf9] p-3">
            <label className="relative block" htmlFor="conversation-search">
              <span className="sr-only">البحث في المحادثات</span>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-soft">
                search
              </span>
              <input
                id="conversation-search"
                data-dialog-initial-focus={!selected || undefined}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث في الرسائل..."
                className="h-10 w-full rounded-lg border border-outline-variant bg-white py-2 pr-10 pl-3 text-xs font-semibold text-on-surface outline-none placeholder:text-on-surface-soft/70 focus:border-primary/40 focus:ring-4 focus:ring-primary/[0.06]"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white py-1">
            {isLoading ? (
              <div role="status" className="space-y-2 px-1 py-2" aria-label="جاري تحميل المحادثات">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="flex animate-pulse items-center gap-3 rounded-xl bg-white p-3">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-surface-container" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2.5 w-2/3 rounded bg-surface-container" />
                      <div className="h-2 w-5/6 rounded bg-surface-container-low" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversationsError ? (
              <div role="alert" className="flex min-h-60 flex-col items-center justify-center px-6 text-center text-danger">
                <span className="material-symbols-outlined text-3xl">cloud_off</span>
                <p className="mt-3 text-xs font-black">تعذر تحميل المحادثات</p>
                <button
                  type="button"
                  onClick={() => void mutate()}
                  className="mt-3 rounded-lg border border-danger/20 bg-white px-3 py-2 text-[10px] font-black"
                >
                  المحاولة مجدداً
                </button>
              </div>
            ) : missingRequestedConversation ? (
              <div role="alert" className="flex min-h-60 flex-col items-center justify-center px-6 text-center text-danger">
                <span className="material-symbols-outlined text-3xl">chat_error</span>
                <p className="mt-3 text-xs font-black">المحادثة المطلوبة لم تعد متاحة لهذا الحساب</p>
                <button type="button" onClick={returnToInbox} className="btn-secondary mt-4 min-h-9 px-3 py-2 text-[10px]">
                  العودة للصندوق
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-white text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[27px]">mark_chat_unread</span>
                </div>
                <h3 className="mt-4 text-sm font-black text-on-surface">صندوقك جاهز</h3>
                <p className="mt-1 text-[11px] font-semibold leading-6 text-on-surface-soft">
                  ستظهر المحادثات هنا عند حجز غرض أو استلام طلب جديد.
                </p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-soft">search_off</span>
                <p className="mt-3 text-xs font-black text-on-surface-variant">لا توجد نتائج مطابقة</p>
                <button type="button" onClick={() => setSearch("")} className="mt-2 text-[10px] font-black text-primary hover:underline">
                  مسح البحث
                </button>
              </div>
            ) : (
              <div>
                {filteredConversations.map((conversation) => {
                  const other = getOtherParticipant(conversation, user?._id);
                  const hasUnread = (conversation.unreadCount || 0) > 0;
                  const name = other?.name || "مستخدم عون";
                  const avatarSrc = other?.avatar || "";
                  const avatarColors = getAvatarBgColor(name);
                  const isSelected = conversation._id === selectedId;

                  return (
                    <button
                      key={conversation._id}
                      type="button"
                      onClick={() => void openConversation(conversation)}
                      aria-current={isSelected ? "true" : undefined}
                      className={`group relative flex w-full items-center gap-3 border-b border-black/[0.055] px-4 py-3 text-right transition-colors ${
                        isSelected
                          ? "bg-primary-soft/70"
                          : hasUnread
                            ? "bg-primary-softer/55"
                            : "bg-white hover:bg-[#f8faf9]"
                      }`}
                    >
                      {isSelected && (
                        <span aria-hidden="true" className="absolute inset-y-0 right-0 w-[3px] bg-primary" />
                      )}

                      <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/[0.04] text-sm font-black ${avatarColors.bg} ${avatarColors.text}`}>
                        {avatarSrc ? (
                          <Image src={avatarSrc} alt="" fill className="object-cover" sizes="44px" />
                        ) : (
                          <span>{name[0]?.toUpperCase()}</span>
                        )}
                        {hasUnread && (
                          <span aria-hidden="true" className="absolute bottom-0.5 left-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`min-w-0 flex-1 truncate text-[12px] ${hasUnread ? "font-black text-on-surface" : "font-extrabold text-on-surface-variant"}`}>
                            {conversation.item?.title || "غرض غير متاح"}
                          </p>
                          <time className="shrink-0 text-[9px] font-bold text-on-surface-soft">
                            {formatTimestamp(conversation.lastMessageAt || conversation.updatedAt)}
                          </time>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] font-bold text-on-surface-soft">{name}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <p className={`min-w-0 flex-1 truncate text-[10.5px] ${hasUnread ? "font-extrabold text-on-surface-variant" : "font-semibold text-on-surface-soft"}`}>
                            {conversation.lastMessage || "ابدأ التنسيق والحديث الآن..."}
                          </p>
                          {hasUnread && (
                            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-primary px-1 text-[9px] font-black text-white">
                              {conversation.unreadCount > 99 ? "+99" : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <div dir="rtl" className={`${selected ? "flex" : "hidden lg:flex"} min-h-0 min-w-0 bg-[#f5f7f6] lg:col-start-1 lg:row-start-1`}>
          {selected ? (
            <ChatPanel
              key={selected._id}
              conversationId={selected._id}
              itemTitle={selected.item?.title || "الغرض"}
              participantName={selectedParticipant?.name || "مستخدم عون"}
              participantAvatar={selectedParticipant?.avatar}
              onBack={returnToInbox}
              onClose={onClose}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
                <span className="material-symbols-outlined text-[30px]">forum</span>
                {unreadTotal > 0 && (
                  <span className="absolute -left-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-lg border-2 border-[#f3f7f5] bg-primary px-1 text-[9px] font-black text-white">
                    {unreadTotal > 99 ? "+99" : unreadTotal}
                  </span>
                )}
              </div>
              <h2 className="mt-5 text-lg font-black text-on-surface">اختر محادثة</h2>
              <p className="mt-2 max-w-sm text-xs font-semibold leading-6 text-on-surface-soft">
                اختر محادثة من القائمة لتنسيق تفاصيل التسليم.
              </p>
            </div>
          )}
        </div>
      </div>
    </AccessibleDialog>
  );
}
