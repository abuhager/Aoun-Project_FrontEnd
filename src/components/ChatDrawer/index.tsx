"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChatRoom } from "@/hooks/useChatRoom";
import AccessibleDialog from "@/components/ui/AccessibleDialog";
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
  onClose: () => void;
  onBack?: () => void;
}

const getSenderId = (message: ChatMessage) => (
  typeof message.sender === "string" ? message.sender : message.sender._id
);

const formatMessageTime = (createdAt: string) => (
  new Date(createdAt).toLocaleTimeString("ar-JO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
);

/**
 * محتوى المحادثة دون غلاف Dialog. يُستخدم داخل مركز الرسائل ذي العمودين،
 * ويُغلّف بحوار مستقل عند فتح محادثة مباشرة من صفحة الغرض.
 */
export function ChatPanel({
  conversationId,
  itemTitle,
  onClose,
  onBack,
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
    if (!isJoined) return "الاتصال بالمحادثة غير جاهز";
    return null;
  }, [error, isJoined, loading]);

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white" aria-label={`محادثة حول ${itemTitle}`}>
      <header className="relative flex min-h-[76px] shrink-0 items-center gap-3 border-b border-black/[0.07] bg-white px-4 sm:px-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="العودة إلى قائمة المحادثات"
            className="touch-target flex shrink-0 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-primary lg:hidden"
          >
            <span className="material-symbols-outlined text-[21px]">arrow_forward</span>
          </button>
        )}

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-container">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
          >
            forum
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-[15px] font-black text-on-surface sm:text-base">
              {itemTitle}
            </h2>
            <span className="hidden shrink-0 rounded-md bg-surface-container-low px-2 py-1 text-[9px] font-black text-on-surface-soft sm:inline-flex">
              محادثة الغرض
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-on-surface-soft">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${isJoined ? "bg-emerald-500" : "bg-amber-400"}`}
            />
            {isJoined ? "متصل وآمن" : "جاري تجهيز الاتصال"}
          </p>
        </div>

        <button
          type="button"
          aria-label="إغلاق المحادثة"
          onClick={onClose}
          className="touch-target flex shrink-0 items-center justify-center rounded-xl text-on-surface-soft hover:bg-surface-container-low hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[21px]">close</span>
        </button>
      </header>

      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain bg-[#f3f7f5] px-4 py-5 sm:px-6"
        role="log"
        aria-live="polite"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.32]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,117,107,.10) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto min-h-full w-full max-w-3xl">
          {hasOlder && (
            <div className="pb-4 text-center">
              <button
                type="button"
                disabled={loadingOlder}
                onClick={handleLoadOlder}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-3.5 py-1.5 text-[10px] font-black text-primary shadow-sm hover:border-primary/30 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[15px]">history</span>
                {loadingOlder ? "جاري التحميل..." : "تحميل رسائل أقدم"}
              </button>
            </div>
          )}

          {isJoined && !canSendMessages && (
            <div className="mx-auto mb-4 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-[11px] font-bold leading-6 text-amber-800">
              هذه المحادثة للقراءة فقط لأن الحجز لم يعد قائماً.
            </div>
          )}

          {statusMessage && messages.length === 0 && (
            <div
              role={error ? "alert" : "status"}
              className={`flex min-h-52 flex-col items-center justify-center gap-3 text-center text-xs font-bold ${
                error ? "text-danger" : "text-on-surface-soft"
              }`}
            >
              <span
                aria-hidden="true"
                className={`material-symbols-outlined text-3xl ${loading ? "animate-pulse" : ""}`}
              >
                {error ? "wifi_off" : "sync"}
              </span>
              {statusMessage}
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/10 bg-white text-primary shadow-sm">
                <span className="material-symbols-outlined text-[30px]">handshake</span>
              </div>
              <h3 className="mt-4 text-base font-black text-on-surface">ابدأ تنسيق عملية التسليم</h3>
              <p className="mt-1 max-w-sm text-xs font-semibold leading-6 text-on-surface-soft">
                اتفقا هنا على الموعد والمكان المناسبين، ولا تشارك بيانات حساسة لا يحتاجها الطرف الآخر.
              </p>
            </div>
          )}

          {messages.map((message, index) => {
            const currentSenderId = getSenderId(message);
            const isMe = currentSenderId === user?._id || currentSenderId === "me";
            const previousSenderId = index > 0 ? getSenderId(messages[index - 1]) : null;
            const isGrouped = previousSenderId === currentSenderId;
            const isTemporary = message._id.startsWith("temp-");

            return (
              <div
                key={message._id}
                className={`flex w-full ${isGrouped ? "mt-1" : "mt-4"}`}
              >
                <div className={`max-w-[84%] sm:max-w-[72%] ${isMe ? "ml-auto" : "mr-auto"}`}>
                  <div
                    className={`break-words whitespace-pre-wrap px-4 py-2.5 text-right text-[13px] leading-7 shadow-sm sm:text-[13.5px] ${
                      isMe
                        ? "rounded-2xl rounded-br-md bg-primary text-white shadow-[0_8px_20px_rgba(0,117,107,.14)]"
                        : "rounded-2xl rounded-bl-md border border-black/[0.07] bg-white text-on-surface"
                    } ${isTemporary ? "opacity-60" : ""}`}
                  >
                    <p>{message.text}</p>
                    <span
                      dir="ltr"
                      className={`mt-1 flex items-center justify-end gap-1 text-[9px] font-semibold ${
                        isMe ? "text-white/65" : "text-on-surface-soft"
                      }`}
                    >
                      {isTemporary ? "جاري الإرسال..." : formatMessageTime(message.createdAt)}
                      {isMe && !isTemporary && (
                        <span className="material-symbols-outlined text-[12px]">
                          {message.read ? "done_all" : "done"}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {error && messages.length > 0 && (
            <p role="alert" className="py-3 text-center text-[11px] font-bold text-danger">
              {error}
            </p>
          )}

          {isTyping && (
            <div className="mt-3 flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3.5 py-2 text-[10px] font-bold text-on-surface-variant shadow-sm">
                <span>الطرف الآخر يكتب</span>
                <span aria-hidden="true" className="flex gap-0.5">
                  <i className="h-1 w-1 animate-pulse rounded-full bg-primary" />
                  <i className="h-1 w-1 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
                  <i className="h-1 w-1 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="safe-area-bottom shrink-0 border-t border-black/[0.07] bg-white px-3 pt-3 sm:px-5">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-outline-variant bg-[#f8faf9] p-1.5 shadow-[inset_0_1px_2px_rgba(16,37,34,.025)] focus-within:border-primary/45 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/[0.07]">
          <button
            type="button"
            aria-label="إرسال الرسالة"
            onClick={handleSend}
            disabled={!canSend}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_7px_16px_rgba(0,117,107,.2)] hover:bg-primary-container disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSending ? "hourglass_top" : "send"}
            </span>
          </button>
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
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-right text-sm font-semibold text-on-surface outline-none placeholder:font-medium placeholder:text-on-surface-soft/70 disabled:opacity-60"
          />
        </div>
        <p className="mx-auto mt-1.5 max-w-3xl text-center text-[9px] font-semibold text-on-surface-soft/80">
          Enter للإرسال · Shift + Enter لسطر جديد
        </p>
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
      overlayClassName="fixed inset-0 z-[120] flex items-center justify-center bg-[#071d21]/70 p-0 backdrop-blur-[5px] sm:p-5"
      panelClassName="relative flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(760px,calc(100dvh-2.5rem))] sm:max-w-3xl sm:rounded-[24px] sm:border sm:border-white/20"
    >
      <ChatPanel
        conversationId={conversationId}
        itemTitle={itemTitle}
        onClose={onClose}
      />
    </AccessibleDialog>
  );
}
