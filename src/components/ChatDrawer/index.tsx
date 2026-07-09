"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChatRoom, type ChatMessage } from "@/hooks/useChatRoom";

interface ChatDrawerProps {
  convId?: string;
  itemId?: string;
  conversationId?: string;
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

function getSenderId(msg: ChatMessage): string {
  return typeof msg.sender === "string" ? msg.sender : msg.sender._id;
}

export default function ChatDrawer({ convId, itemId, conversationId, itemTitle, isOpen, onClose }: ChatDrawerProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const finalConvId = convId || conversationId || itemId || "";

  const { messages, isTyping, loading, sendMessage, emitTyping } = useChatRoom({
    convId: isOpen ? finalConvId : null,
  });

  const trimmedText = useMemo(() => text.trim(), [text]);
  
  const canSend = useMemo(
    () => Boolean(trimmedText) && Boolean(finalConvId) && !isSending,
    [trimmedText, finalConvId, isSending]
  );

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSend = async () => {
    if (!canSend) return;

    const currentText = trimmedText;
    setIsSending(true);
    try {
      setText("");
      const ok = await sendMessage(currentText);
      if (!ok) setText(currentText);
    } catch (error) {
      console.error("[ChatDrawer] send failed:", error);
      setText(currentText);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120]" dir="rtl">
      <div className="absolute inset-0 bg-[#0f1720]/45 backdrop-blur-[3px]" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-[121] flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-black/5 bg-[#fcfbf8] shadow-2xl">
        
        {/* هيدر الشات */}
        <div className="shrink-0 border-b border-[#ece7de] bg-white px-5 py-4 flex justify-between items-center">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[#1c2324] tracking-tight">المحادثة الفورية</p>
            <p className="mt-0.5 truncate text-[11px] font-bold text-primary">{itemTitle}</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-xl text-[#6f6a63] hover:bg-[#f2eee8] transition-all text-sm font-bold">✕</button>
        </div>

        {/* جسم الشات المطور هندسياً */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-[#f8f6f2]" role="log" aria-live="polite">
          {loading && messages.length === 0 && (
            <div className="text-center text-xs text-[#9b948c] font-semibold py-8 animate-pulse">جاري تحميل الرسائل...</div>
          )}
          {!loading && messages.length === 0 && (
            <div className="text-center text-xs text-[#9b948c] font-bold py-12">ابدأ المحادثة الآن لتنسيق آلية وموعد التسليم.</div>
          )}

          {messages.map((msg, i) => {
            const senderId = getSenderId(msg);
            const isMe = senderId === user?._id || senderId === "me" || msg.sender === "me";
            const prevSenderId = i > 0 ? getSenderId(messages[i - 1]) : null;
            const isGrouped = prevSenderId === senderId;
            const isTemp = msg._id.startsWith("temp-");

            return (
              <div 
                key={msg._id} 
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"} ${isGrouped ? "mt-1" : "mt-4"}`}
              >
                <div className="max-w-[75%] flex flex-col">
                  {/* فقاعة الرسالة المصقولة */}
                  <div 
                    className={`px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm break-words whitespace-pre-wrap select-text ${
                      isMe 
                        ? "bg-primary text-white rounded-[18px] rounded-tl-sm self-end text-right" 
                        : "border border-[#ece7de] bg-white text-[#1f2526] rounded-[18px] rounded-tr-sm self-start text-right"
                    } ${isTemp ? "opacity-60" : ""}`}
                  >
                    <p>{msg.text}</p>
                    
                    {/* وقت الإرسال مدمج بنعومة في الأسفل دون التسبب بتمدد غير مبرر */}
                    <span className={`block text-[9px] mt-1 text-left font-medium tracking-tight ${isMe ? "text-white/70" : "text-[#9b948c]"}`}>
                      {isTemp ? "جاري الإرسال..." : new Date(msg.createdAt).toLocaleTimeString("ar-JO", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* مؤشر جاري الكتابة الاحترافي */}
          {isTyping && (
            <div className="flex justify-start mt-2">
              <div className="rounded-[16px] border border-[#ece7de] bg-white px-3.5 py-2 text-[11px] font-bold text-primary flex items-center gap-1 animate-pulse">
                <span>جاري كتابة رد</span>
                <span className="inline-flex gap-0.5"><span className="animate-bounce">.</span><span className="animate-bounce [animation-delay:0.2s]">.</span><span className="animate-bounce [animation-delay:0.4s]">.</span></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* صندوق مدخلات الرسائل السفلي */}
        <div className="shrink-0 border-t bg-white px-4 py-3.5">
          <div className="flex items-center gap-2 rounded-[24px] border border-[#ece7de] bg-[#fbfaf8] p-1.5 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/10 transition-all">
            <button 
              type="button" 
              onClick={handleSend} 
              disabled={!canSend} 
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm disabled:opacity-40 disabled:hover:translate-y-0 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[17px]">{isSending ? "hourglass_top" : "send"}</span>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (finalConvId) emitTyping();
              }}
              onKeyDown={async (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); await handleSend(); } }}
              placeholder="اكتب رسالة لتنسيق التسليم..."
              className="h-10 flex-1 bg-transparent px-3 text-right text-[13px] font-bold text-[#1c2324] outline-none placeholder:text-[#b0a99f] placeholder:font-medium"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}