"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/lib/api/axiosInstance";
import ChatDrawer from "@/components/ChatDrawer";

const API = process.env.NEXT_PUBLIC_API_URL!;

interface ConvSummary {
  _id: string;
  item: { _id: string; title: string; images?: string[] };
  lastMessage?: { text: string; createdAt: string };
  unreadCount: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConversationList({ isOpen, onClose }: Props) {
  const { user, isLoggedIn } = useAuth();
  const [convs, setConvs]       = useState<ConvSummary[]>([]);
  const [loading, setLoading]   = useState(false);
  const [activeConv, setActiveConv] = useState<ConvSummary | null>(null);

  const fetchConvs = useCallback(async () => {
    if (!isLoggedIn || !user?._id) return;
    setLoading(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API}/api/conversations`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setConvs(Array.isArray(data.conversations) ? data.conversations : []);
    } catch {
      setConvs([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user?._id]);

  useEffect(() => {
    if (isOpen) fetchConvs();
  }, [isOpen, fetchConvs]);

  if (!isOpen) return null;

  // ── إذا فتح محادثة معينة ──
  if (activeConv) {
    return (
      <ChatDrawer
        itemId={activeConv.item._id}
        itemTitle={activeConv.item.title}
        isOpen={true}
        onClose={() => setActiveConv(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm h-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="font-black text-sm text-gray-800">الرسائل</p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="إغلاق"
          >
            <span className="material-symbols-outlined text-gray-500 text-base">close</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))
          ) : convs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-20 text-gray-400">
              <span className="material-symbols-outlined text-4xl">inbox</span>
              <p className="text-sm font-semibold">لا توجد محادثات بعد</p>
            </div>
          ) : (
            convs.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setActiveConv(conv)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-right"
              >
                {/* صورة الغرض */}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {conv.item.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conv.item.images[0]}
                      alt={conv.item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-xl">
                      inventory_2
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {conv.item.title}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString("ar-JO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conv.lastMessage?.text ?? "ابدأ المحادثة"}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-primary text-white text-[10px]
                                   font-black rounded-full flex items-center justify-center px-1 shrink-0">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}