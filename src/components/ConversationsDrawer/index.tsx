"use client";

import { useState, useEffect } from "react";
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
}

export default function ConversationsDrawer({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    axiosInstance
      .get<Conversation[]>("/conversations")
      .then((r) => setConversations(r.data))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // لو اختار محادثة — افتح ChatDrawer مباشرة
  if (selected) {
    return (
      <ChatDrawer
        itemId={selected.item._id}
        itemTitle={selected.item.title}
        isOpen={true}
        onClose={() => setSelected(null)} // رجوع للقائمة
      />
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-sm h-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <p className="font-black text-sm text-gray-800">الرسائل</p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="إغلاق"
            type="button"
          >
            <span className="material-symbols-outlined text-gray-500 text-base">close</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-2 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-20 text-gray-400">
              <span className="material-symbols-outlined text-4xl">chat_bubble_outline</span>
              <p className="text-sm font-semibold">لا توجد محادثات بعد</p>
              <p className="text-xs text-center px-8 text-gray-400">
                احجز غرضاً وابدأ محادثة مع المتبرع
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants.find((p) => p._id !== user?._id);
              return (
                <button
                  key={conv._id}
                  onClick={() => setSelected(conv)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-right"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {other?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={other.avatar}
                        alt={other.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="material-symbols-outlined text-primary text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        account_circle
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-bold text-gray-800 truncate">{conv.item.title}</p>
                    <p className="text-xs text-gray-400 truncate">{other?.name}</p>
                  </div>

                  {/* Unread badge */}
                  {conv.unread > 0 && (
                    <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {conv.unread > 9 ? '9+' : conv.unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}