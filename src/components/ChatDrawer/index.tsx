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

const getSenderId = (message: ChatMessage) => (
  typeof message.sender === "string" ? message.sender : message.sender._id
);

export default function ChatDrawer({
  conversationId,
  itemTitle,
  isOpen,
  onClose,
}: ChatDrawerProps) {
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
  } = useChatRoom({ conversationId: isOpen ? conversationId : null });

  const trimmedText = text.trim();
  const canSend = Boolean(trimmedText) && canSendMessages && !isSending;
  const lastMessageId = messages.at(-1)?._id;

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && lastMessageId) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isOpen, isTyping, lastMessageId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
    requestAnimationFrame(() => {
      if (container) container.scrollTop += container.scrollHeight - previousHeight;
    });
  };

  const statusMessage = useMemo(() => {
    if (error) return error;
    if (loading) return "جاري تحميل الرسائل...";
    if (!isJoined) return "الاتصال بالمحادثة غير جاهز";
    return null;
  }, [error, isJoined, loading]);

  if (!isOpen) return null;

  return (
    <AccessibleDialog
      ariaLabel={`محادثة حول ${itemTitle}`}
      onClose={onClose}
      panelAs="aside"
      overlayClassName="fixed inset-0 z-[120] bg-[#0f1720]/45 backdrop-blur-[3px]"
      panelClassName="fixed inset-y-0 right-0 z-[121] flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-black/5 bg-[#fcfbf8] shadow-2xl"
    >
        <div className="flex shrink-0 items-center justify-between border-b border-[#ece7de] bg-white px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black tracking-tight text-[#1c2324]">المحادثة الفورية</p>
            <p className="mt-0.5 truncate text-[11px] font-bold text-primary">{itemTitle}</p>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="touch-target flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-[#6f6a63] transition-all hover:bg-[#f2eee8]"
          >
            ✕
          </button>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#f8f6f2] px-4 py-4"
          role="log"
          aria-live="polite"
        >
          {hasOlder && (
            <div className="pb-2 text-center">
              <button
                type="button"
                disabled={loadingOlder}
                onClick={handleLoadOlder}
                className="rounded-full border border-[#ded8cf] bg-white px-4 py-1.5 text-[11px] font-bold text-primary disabled:opacity-50"
              >
                {loadingOlder ? "جاري التحميل..." : "تحميل رسائل أقدم"}
              </button>
            </div>
          )}

          {isJoined && !canSendMessages && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] font-bold text-amber-700">
              هذه المحادثة للقراءة فقط لأن الحجز لم يعد قائماً.
            </div>
          )}

          {statusMessage && messages.length === 0 && (
            <div className={`py-8 text-center text-xs font-semibold ${error ? "text-red-500" : "animate-pulse text-[#9b948c]"}`}>
              {statusMessage}
            </div>
          )}
          {!loading && !error && messages.length === 0 && (
            <div className="py-12 text-center text-xs font-bold text-[#9b948c]">
              ابدأ المحادثة لتنسيق آلية وموعد التسليم.
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
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"} ${isGrouped ? "mt-1" : "mt-4"}`}
              >
                <div className="flex max-w-[75%] flex-col">
                  <div
                    className={`break-words whitespace-pre-wrap px-4 py-2.5 text-right text-[13.5px] leading-relaxed shadow-sm ${
                      isMe
                        ? "self-end rounded-[18px] rounded-tl-sm bg-primary text-white"
                        : "self-start rounded-[18px] rounded-tr-sm border border-[#ece7de] bg-white text-[#1f2526]"
                    } ${isTemporary ? "opacity-60" : ""}`}
                  >
                    <p>{message.text}</p>
                    <span className={`mt-1 block text-left text-[9px] font-medium ${isMe ? "text-white/70" : "text-[#9b948c]"}`}>
                      {isTemporary
                        ? "جاري الإرسال..."
                        : new Date(message.createdAt).toLocaleTimeString("ar-JO", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {error && messages.length > 0 && (
            <p className="py-2 text-center text-[11px] font-bold text-red-500">{error}</p>
          )}

          {isTyping && (
            <div className="mt-2 flex justify-start">
              <div className="flex items-center gap-1 rounded-[16px] border border-[#ece7de] bg-white px-3.5 py-2 text-[11px] font-bold text-primary">
                <span>جاري كتابة رد</span>
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 border-t bg-white px-4 py-3.5">
          <div className="flex items-end gap-2 rounded-[24px] border border-[#ece7de] bg-[#fbfaf8] p-1.5 transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/10">
            <button
              type="button"
              aria-label="إرسال الرسالة"
              onClick={handleSend}
              disabled={!canSend}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <span className="material-symbols-outlined text-[17px]">
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
                    ? "اكتب رسالة لتنسيق التسليم..."
                    : "المحادثة للقراءة فقط"
              }
              className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-right text-[13px] font-bold text-[#1c2324] outline-none placeholder:font-medium placeholder:text-[#b0a99f] disabled:opacity-60"
            />
          </div>
        </div>
    </AccessibleDialog>
  );
}
