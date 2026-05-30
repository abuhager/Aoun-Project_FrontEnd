"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";

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
  itemId,
  itemTitle,
  isOpen,
  onClose,
}: ChatDrawerProps) {
  const { user } = useAuth();

  const {
    messages,
    loading,
    sending,
    text,
    setText,
    sendMessage,
    typingUser,
    emitTyping,
    emitStopTyping,
    markRead,
  } = useChat(itemId);

  const bottomRef = useRef<HTMLDivElement>(null);
  const canSend = useMemo(() => !!text.trim() && !sending, [text, sending]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      markRead();
    }
  }, [messages, isOpen, markRead]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120]" dir="rtl">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 left-auto z-[121] h-dvh w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-gray-800">الرسائل</p>
              <p className="truncate text-xs text-gray-400">{itemTitle}</p>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="إغلاق"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div className="h-9 w-40 rounded-2xl bg-gray-200 animate-pulse" />
              </div>
            ))
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-gray-400">
              <span className="material-symbols-outlined text-4xl">
                chat_bubble_outline
              </span>
              <p className="text-sm font-semibold">ابدأ المحادثة</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === user?._id;

              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed break-words shadow-sm ${
                      isMe
                        ? "bg-primary text-white rounded-tl-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tr-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isMe ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("ar-JO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {typingUser && (
            <div className="px-1 text-[11px] text-gray-400">
              {typingUser} يكتب الآن...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={sendMessage}
              disabled={!canSend}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="إرسال"
            >
              <SendIcon />
            </button>

            <input
              type="text"
              dir="rtl"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (e.target.value.trim()) emitTyping();
                else emitStopTyping();
              }}
              onBlur={emitStopTyping}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  await sendMessage();
                }
              }}
              placeholder="اكتب رسالة..."
              className="h-11 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm text-right outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}