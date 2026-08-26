"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import AccessibleDialog from "@/components/ui/AccessibleDialog";
import { useAuth } from "@/context/AuthContext";
import { useChatRoom } from "@/hooks/useChatRoom";
import type { ChatMessage } from "@/types/chat.types";

interface ChatDrawerProps {
  conversationId: string;
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatPanelProps {
  conversationId: string;
  itemTitle: string;
  participantName?: string;
  participantAvatar?: string;
  onClose: () => void;
  onBack?: () => void;
  showClose?: boolean;
}

const getSenderId = (message: ChatMessage) => (
  typeof message.sender === "string" ? message.sender : message.sender._id
);

const isSameDay = (first: string, second: string) => (
  new Date(first).toDateString() === new Date(second).toDateString()
);

const formatMessageTime = (createdAt: string) => (
  new Date(createdAt).toLocaleTimeString("ar-JO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
);

const formatMessageDate = (createdAt: string) => {
  const date = new Date(createdAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "اليوم";
  if (date.toDateString() === yesterday.toDateString()) return "أمس";
  return date.toLocaleDateString("ar-JO", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
};

export function ChatPanel({
  conversationId,
  itemTitle,
  participantName = "محادثة التسليم",
  participantAvatar,
  onClose,
  onBack,
  showClose = true,
}: ChatPanelProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isJoined,
    canSendMessages,
    isTyping,
    loading,
    error,
    hasOlder,
    loadingOlder,
    sendMessage,
    emitTyping,
    loadOlder,
  } = useChatRoom({ conversationId: conversationId });

  const trimmedText = text.trim();
  const canSend = Boolean(trimmedText) && canSendMessages && !isSending;
  const lastMessageId = messages.at(-1)?._id;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [conversationId]);

  useEffect(() => {
    if (!lastMessageId) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isTyping, lastMessageId]);

  const handleSend = async () => {
    if (!canSend) return;
    const currentText = trimmedText;
    setText("");
    setIsSending(true);
    const sent = await sendMessage(currentText);
    if (!sent) setText(currentText);
    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleLoadOlder = async () => {
    const container = scrollRef.current;
    const previousHeight = container?.scrollHeight || 0;
    await loadOlder();
    window.requestAnimationFrame(() => {
      if (container) container.scrollTop += container.scrollHeight - previousHeight;
    });
  };

  const statusMessage = useMemo(() => {
    if (error) return error;
    if (loading) return "جاري تحميل الرسائل...";
    if (!isJoined) return "جاري الاتصال بالمحادثة...";
    return null;
  }, [error, isJoined, loading]);

  return (
    <section
      dir="rtl"
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-white"
      aria-label={`محادثة حول ${itemTitle}`}
    >
      <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-black/[0.08] bg-white px-4 sm:px-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="العودة إلى قائمة المحادثات"
            className="touch-target -mr-2 flex shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low lg:hidden"
          >
            <span className="material-symbols-outlined text-[21px]">arrow_forward</span>
          </button>
        )}

        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-sm font-black text-primary-container">
          {participantAvatar ? (
            <Image src={participantAvatar} alt="" fill sizes="44px" className="object-cover" />
          ) : (
            <span>{participantName[0] || "م"}</span>
          )}
          <span
            aria-label={isJoined ? "متصل" : "غير متصل"}
            className={`absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-white ${
              isJoined ? "bg-emerald-500" : "bg-gray-300"
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[14px] font-black text-on-surface sm:text-[15px]">
            {participantName}
          </h2>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-on-surface-soft">
            <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[14px] text-primary">
              inventory_2
            </span>
            <span className="truncate">{itemTitle}</span>
          </p>
        </div>

        <span className={`hidden items-center gap-1.5 text-[10px] font-bold sm:flex ${isJoined ? "text-emerald-700" : "text-on-surface-soft"}`}>
          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${isJoined ? "bg-emerald-500" : "bg-gray-300"}`} />
          {isJoined ? "متصل" : "غير متصل"}
        </span>

        {showClose && (
          <button
            type="button"
            aria-label="إغلاق المحادثة"
            onClick={onClose}
            className="touch-target -ml-2 flex shrink-0 items-center justify-center rounded-lg text-on-surface-soft hover:bg-surface-container-low hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[21px]">close</span>
          </button>
        )}
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f5f7f6] px-3 py-4 sm:px-6"
        role="log"
        aria-live="polite"
      >
        <div className="mx-auto min-h-full w-full max-w-3xl">
          {hasOlder && (
            <div className="pb-4 text-center">
              <button
                type="button"
                disabled={loadingOlder}
                onClick={handleLoadOlder}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-[10px] font-black text-primary shadow-sm hover:border-primary/30 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">history</span>
                {loadingOlder ? "جاري التحميل..." : "تحميل رسائل أقدم"}
              </button>
            </div>
          )}

          {isJoined && !canSendMessages && (
            <div className="mx-auto mb-4 max-w-lg rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-[10px] font-bold leading-5 text-amber-800">
              هذه المحادثة للقراءة فقط لأن الحجز لم يعد قائماً.
            </div>
          )}

          {statusMessage && messages.length === 0 && (
            <div
              role={error ? "alert" : "status"}
              className={`flex min-h-60 flex-col items-center justify-center gap-2 text-center text-xs font-bold ${
                error ? "text-danger" : "text-on-surface-soft"
              }`}
            >
              <span className={`material-symbols-outlined text-[28px] ${loading ? "animate-pulse" : ""}`}>
                {error ? "wifi_off" : "sync"}
              </span>
              {statusMessage}
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
                <span className="material-symbols-outlined text-[26px]">chat</span>
              </div>
              <h3 className="mt-4 text-sm font-black text-on-surface">ابدأ المحادثة</h3>
              <p className="mt-1 max-w-sm text-[11px] font-semibold leading-6 text-on-surface-soft">
                نسّق موعد ومكان التسليم مع الطرف الآخر.
              </p>
            </div>
          )}

          {messages.map((message, index) => {
            const currentSenderId = getSenderId(message);
            const isMe = currentSenderId === user?._id || currentSenderId === "me";
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const previousSenderId = previousMessage ? getSenderId(previousMessage) : null;
            const showDate = !previousMessage || !isSameDay(previousMessage.createdAt, message.createdAt);
            const isGrouped = !showDate && previousSenderId === currentSenderId;
            const isTemporary = message._id.startsWith("temp-");

            return (
              <div key={message._id}>
                {showDate && (
                  <div className="my-5 flex items-center gap-3" role="separator">
                    <span className="h-px flex-1 bg-black/[0.06]" />
                    <time className="rounded-full bg-white px-3 py-1 text-[9px] font-bold text-on-surface-soft shadow-sm">
                      {formatMessageDate(message.createdAt)}
                    </time>
                    <span className="h-px flex-1 bg-black/[0.06]" />
                  </div>
                )}

                <div className={`flex w-full ${isGrouped ? "mt-1" : "mt-3"}`}>
                  <div className={`max-w-[86%] sm:max-w-[72%] ${isMe ? "ml-auto" : "mr-auto"}`}>
                    <div
                      className={`break-words whitespace-pre-wrap px-3.5 py-2 text-right text-[13px] leading-6 ${
                        isMe
                          ? "rounded-2xl rounded-br-sm bg-primary text-white"
                          : "rounded-2xl rounded-bl-sm border border-black/[0.07] bg-white text-on-surface"
                      } ${isTemporary ? "opacity-60" : ""}`}
                    >
                      <p>{message.text}</p>
                      <span
                        dir="ltr"
                        className={`mt-0.5 flex items-center justify-end gap-1 text-[8.5px] font-semibold ${
                          isMe ? "text-white/65" : "text-on-surface-soft"
                        }`}
                      >
                        {isTemporary ? "جاري الإرسال..." : formatMessageTime(message.createdAt)}
                        {isMe && !isTemporary && (
                          <span className="material-symbols-outlined text-[11px]">
                            {message.read ? "done_all" : "done"}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {error && messages.length > 0 && (
            <p role="alert" className="py-3 text-center text-[10px] font-bold text-danger">
              {error}
            </p>
          )}

          {isTyping && (
            <div className="mt-2 flex justify-start">
              <span className="rounded-xl border border-black/[0.07] bg-white px-3 py-2 text-[10px] font-bold text-on-surface-soft">
                يكتب الآن...
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="safe-area-bottom shrink-0 border-t border-black/[0.08] bg-white px-3 pt-3 sm:px-5">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            maxLength={2_000}
            value={text}
            disabled={!canSendMessages}
            onChange={(event) => {
              setText(event.target.value);
              emitTyping();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder={
              !isJoined
                ? "جاري الاتصال..."
                : canSendMessages
                  ? "اكتب رسالة..."
                  : "المحادثة للقراءة فقط"
            }
            className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-outline-variant bg-[#f8faf9] px-4 py-2.5 text-right text-sm font-semibold text-on-surface outline-none placeholder:font-medium placeholder:text-on-surface-soft/70 focus:border-primary/45 focus:bg-white focus:ring-4 focus:ring-primary/[0.06] disabled:opacity-60"
          />
          <button
            type="button"
            aria-label="إرسال الرسالة"
            onClick={handleSend}
            disabled={!canSend}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_6px_14px_rgba(0,117,107,.18)] hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSending ? "hourglass_top" : "send"}
            </span>
          </button>
        </div>
      </footer>
    </section>
  );
}

export default function ChatDrawer({
  conversationId,
  itemTitle,
  isOpen,
  onClose,
}: ChatDrawerProps) {
  if (!isOpen) return null;

  return (
    <AccessibleDialog
      ariaLabel={`محادثة حول ${itemTitle}`}
      onClose={onClose}
      overlayClassName="fixed inset-0 z-[120] flex items-center justify-center bg-[#071d21]/65 p-0 backdrop-blur-sm sm:p-5"
      panelClassName="relative flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(740px,calc(100dvh-2.5rem))] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-white/20"
    >
      <ChatPanel
        conversationId={conversationId}
        itemTitle={itemTitle}
        onClose={onClose}
      />
    </AccessibleDialog>
  );
}
