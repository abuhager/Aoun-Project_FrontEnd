"use client";

import { useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/hooks/useChat';

function SendIcon() {
  return <span className="material-symbols-outlined text-base">send</span>;
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
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      markRead(); // ✅ علّم كمقروء عند الفتح
    }
  }, [messages, isOpen, markRead]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm h-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <div>
            <p className="font-black text-sm text-gray-800">محادثة</p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{itemTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="إغلاق"
            type="button"
          >
            <span className="material-symbols-outlined text-gray-500 text-base">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="h-8 w-40 bg-gray-200 rounded-2xl animate-pulse" />
              </div>
            ))
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
              <span className="material-symbols-outlined text-4xl">chat_bubble_outline</span>
              <p className="text-sm font-semibold">ابدأ المحادثة</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === user?._id;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                    <p className={`text-[9px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('ar-JO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {typingUser && (
            <div className="text-[11px] text-gray-400 px-1">
              {typingUser} يكتب الآن...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-gray-100 bg-white flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (e.target.value.trim()) emitTyping();
              else emitStopTyping();
            }}
            onBlur={emitStopTyping}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                await sendMessage();
              }
            }}
            placeholder="اكتب رسالة..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!canSend}
            className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="إرسال"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}