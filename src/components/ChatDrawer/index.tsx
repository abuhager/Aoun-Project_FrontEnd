"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useChat from "@/hooks/useChat";

function SendIcon() {
  return <span className="material-symbols-outlined text-[18px]">send</span>;
}

interface ChatDrawerProps {
  itemId: string;
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatDrawer({
  itemTitle,
  isOpen,
  onClose,
}: ChatDrawerProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const {
    activeConversation,
    messages = [],
    sendMessage,
  } = useChat();

  const activeConversationId = activeConversation?._id ?? "";
  const safeText = typeof text === "string" ? text : "";

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canSend = useMemo(
    () => !!safeText.trim() && !sending && !!activeConversationId,
    [safeText, sending, activeConversationId]
  );

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleSend = async () => {
    if (!canSend || !activeConversationId) return;
    try {
      setSending(true);
      await sendMessage(activeConversationId, safeText);
      setText("");
    } catch {
      // Error is handled upstream
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120" dir="rtl">
      <div
        className="absolute inset-0 bg-[#0f1720]/45 backdrop-blur-[3px] transition-opacity duration-300"
        onClick={onClose}
      />

      <aside className="fixed inset-y-0 right-0 z-121 flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-black/6 bg-[#fcfbf8] shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
        <div className="relative shrink-0 border-b border-[#ece7de] bg-white/95 px-4 py-4 backdrop-blur-xl">
          <div className="absolute left-0 top-0 h-24 w-24 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 inline-flex items-center gap-1 rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 text-[10px] font-black text-primary">
                <span className="material-symbols-outlined text-[13px]">forum</span>
                محادثة التنسيق
              </div>
              <p className="text-sm font-black text-[#1c2324]">الرسائل</p>
              <p className="mt-1 truncate text-xs font-semibold text-[#8b847c]">
                {itemTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[#6f6a63] transition-all duration-300 hover:bg-[#f2eee8] hover:text-[#1f2526]"
              aria-label="إغلاق"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f7f5f0_0%,#f8f6f2_100%)] px-4 py-4"
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm">
                <span className="material-symbols-outlined text-3xl">chat_bubble_outline</span>
              </div>
              <p className="mt-4 text-sm font-black text-[#243132]">ابدأ المحادثة</p>
              <p className="mt-2 max-w-xs text-xs leading-6 text-[#8a837b]">
                استخدم هذه المساحة لتنسيق وقت ومكان التسليم بشكل واضح وسريع.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, index) => {
                const senderId =
                  typeof msg.sender === "string"
                    ? msg.sender
                    : (msg.sender as { _id?: string })?._id ?? "";

                const isMe = senderId === user?._id;
                const prev = messages[index - 1];
                const prevSenderId =
                  typeof prev?.sender === "string"
                    ? prev.sender
                    : (prev?.sender as { _id?: string })?._id ?? "";

                const isSameSenderAsPrev = prevSenderId === senderId;
                const isTemp = typeof msg._id === "string" && msg._id.startsWith("temp-");

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[84%] ${isSameSenderAsPrev ? "mt-0.5" : "mt-2"}`}>
                      {!isSameSenderAsPrev && (
                        <div
                          className={`mb-1 px-1 text-[10px] font-bold ${
                            isMe ? "text-primary/75" : "text-[#9a938c]"
                          }`}
                        >
                          {isMe ? "أنت" : "الطرف الآخر"}
                        </div>
                      )}

                      <div
                        className={`rounded-[22px] px-3.5 py-2.5 text-sm leading-7 shadow-sm transition-opacity duration-300 ${
                          isTemp ? "opacity-60" : "opacity-100"
                        } ${
                          isMe
                            ? "rounded-tl-md bg-primary text-white"
                            : "rounded-tr-md border border-[#ece7de] bg-white text-[#1f2526]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap wrap-break-word">{msg.text}</p>
                        <p
                          className={`mt-1 text-[10px] font-semibold ${
                            isMe ? "text-white/70" : "text-[#aaa39b]"
                          }`}
                        >
                          {isTemp
                            ? "جاري الإرسال..."
                            : new Date(msg.createdAt).toLocaleTimeString("ar-JO", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#ece7de] bg-white px-3 py-3">
          <div className="rounded-[24px] border border-[#e8e2d9] bg-[#faf8f4] p-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                aria-label="إرسال"
              >
                <SendIcon />
              </button>

              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  dir="rtl"
                  value={safeText}
                  onChange={(e) => setText(e.target.value ?? "")}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      await handleSend();
                    }
                  }}
                  placeholder="اكتب رسالة لتنسيق التسليم..."
                  className="h-11 w-full rounded-2xl border border-transparent bg-transparent px-4 text-right text-sm text-[#1f2526] outline-none transition-all placeholder:text-[#a8a29a] focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/10"
                  aria-label="حقل كتابة الرسالة"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}