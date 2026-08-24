"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import ChatDrawer from "@/components/ChatDrawer";
import { listConversations, markConversationRead } from "@/lib/api/conversationApi";
import type { ConversationListItem } from "@/types/chat.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
  initialConversationId?: string | null;
}

// 🌟 دالة هجينة لتوليد خلفيات ملونة باهتة متناسقة بناءً على الحرف الأول للاسم (Enterprise Touch)
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

// 🌟 دالة تنسيق الوقت الاحترافية للمحادثات
function formatTimestamp(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    
    // إذا كانت الرسالة اليوم، نعرض الوقت فقط
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("ar-JO", { hour: "2-digit", minute: "2-digit", hour12: true });
    }
    
    // إذا كانت أمس
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "أمس";
    }
    
    // خلاف ذلك نعرض التاريخ
    return date.toLocaleDateString("ar-JO", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
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

  const unreadTotal = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  }, [conversations]);

  useEffect(() => {
    onUnreadCountChange?.(unreadTotal);
  }, [unreadTotal, onUnreadCountChange]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => void mutate();

    socket.on("conversation_updated", refresh);
    socket.on("new_conversation", refresh);
    socket.on("messages_read", refresh);

    return () => {
      socket.off("conversation_updated", refresh);
      socket.off("new_conversation", refresh);
      socket.off("messages_read", refresh);
    };
  }, [socket, mutate]);

  const openConversation = useCallback(async (conv: ConversationListItem) => {
    const secureId = conv._id;
    if (!secureId) return;

    setSelectedId(secureId);

    if ((conv.unreadCount || 0) > 0) {
      void mutate(
        (current) => current?.map((conversation) => (
          conversation._id === secureId
            ? { ...conversation, unreadCount: 0 }
            : conversation
        )),
        { revalidate: false }
      );
      try {
        await markConversationRead(secureId);
      } catch (error) {
        console.error("mark read error:", error);
      }
    }
  }, [mutate]);

  if (selected) {
    return (
      <ChatDrawer
        key={selected._id}
        conversationId={selected._id}
        itemTitle={selected.item?.title || "الغرض"}
        isOpen={true}
        onClose={() => {
          setSelectedId(null);
          void mutate();
        }}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110]" dir="rtl">
      <div className="absolute inset-0 bg-[#0f1720]/45 backdrop-blur-[3px]" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-[121] flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-black/[0.06] bg-[#fcfbf8] shadow-2xl">
        {/* الهيدر الاحترافي للمنصة */}
        <div className="shrink-0 border-b border-[#ece7de] bg-white px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-base font-black text-[#1c2324] tracking-tight">الرسائل</h2>
            <p className="text-[11px] font-semibold text-[#8b847c] mt-0.5">جميع المحادثات الخاصة بك في منصة عون</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-xl text-[#6f6a63] hover:bg-[#f2eee8] transition-all text-sm font-bold">✕</button>
        </div>

        {/* قائمة بطاقات المحادثات المتوازنة */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f6f2]">
          {isLoading ? (
            <div className="text-center text-sm text-[#9b948c] font-semibold py-12 animate-pulse">جاري تحميل المحادثات...</div>
          ) : conversationsError ? (
            <div className="py-16 text-center text-xs font-bold text-red-500">تعذر تحميل المحادثات</div>
          ) : selectedId && !selected ? (
            <div className="py-16 text-center text-xs font-bold text-red-500">المحادثة المطلوبة لم تعد متاحة لهذا الحساب</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-xs text-[#9b948c] font-bold py-16">لا توجد محادثات بعد في صندوق الوارد.</div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants?.find((p) => p._id !== user?._id) || conv.owner || conv.requester;
              const hasUnread = (conv.unreadCount || 0) > 0;
              const avatarSrc = other?.avatar || "";
              
              // استخراج الألوان الديناميكية للحرف الأول لجمالية بصريّة فائقة
              const nameKey = other?.name || "م";
              const avatarColors = getAvatarBgColor(nameKey);

              return (
                <button
                  key={conv._id}
                  onClick={() => openConversation(conv)}
                  className={`flex w-full items-center justify-between gap-3 rounded-[20px] border p-4 text-right shadow-sm transition-all duration-300 hover:-translate-y-0.5 group ${
                    hasUnread 
                      ? "border-primary/20 bg-[#f4fffd] ring-1 ring-primary/5" 
                      : "border-[#ece7de] bg-white hover:bg-[#fcfbf8]"
                  }`}
                  type="button"
                >
                  {/* جهة اليمين: الأفاتار + كتل النصوص الرأسية المترابطة */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* الأفاتار المتمركز هيدروليكياً وبصرياً */}
                    <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-black/[0.04] flex items-center justify-center font-black text-sm select-none transition-transform group-hover:scale-[1.02] ${avatarColors.bg} ${avatarColors.text}`}>
                      {avatarSrc ? (
                        <Image src={avatarSrc} alt={nameKey} fill className="object-cover" sizes="48px" />
                      ) : (
                        <span className="mb-0.5">{nameKey[0].toUpperCase()}</span>
                      )}
                    </div>

                    {/* تفاصيل المحادثة متراصة رأسياً بذكاء وعناية تامة */}
                    <div className="flex flex-col min-w-0 text-right flex-1">
                      {/* اسم الغرض / المنتج المحمي من الانفجار النصي */}
                      <p className={`truncate text-[13.5px] font-black tracking-tight max-w-[200px] sm:max-w-[240px] ${hasUnread ? "text-primary" : "text-[#1c2324]"}`}>
                        {conv.item?.title || "غرض غير متاح"}
                      </p>
                      
                      {/* اسم المستخدم الآخر */}
                      <p className="mt-0.5 truncate text-[11px] font-bold text-[#77716a]">
                        {nameKey}
                      </p>
                      
                      {/* سطر المعاينة للرسالة الأخيرة (إنقاذ الـ UX الحاسم) */}
                      <p className={`mt-1.5 truncate text-[11.5px] max-w-[210px] sm:max-w-[250px] ${hasUnread ? "font-bold text-[#1f3a3b]" : "font-medium text-[#9b948c]"}`}>
                        {conv.lastMessage || "ابدأ التنسيق والحديث الآن..."}
                      </p>
                    </div>
                  </div>

                  {/* جهة اليسار: الوقت والمؤشر الأخضر متراصين عمودياً لراحة العين البصرية */}
                  <div className="flex flex-col items-end shrink-0 justify-between h-12 py-0.5">
                    {/* التوقيت المطور */}
                    <span className="text-[10px] font-bold text-[#9b948c] tracking-tight">
                      {formatTimestamp(conv.lastMessageAt || (conv.item ? conv.updatedAt : null))}
                    </span>
                    
                    {/* شارة العداد غير المقروء في مكانها الهندسي المتزن أقصى اليسار */}
                    {hasUnread ? (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black text-white shadow-sm animate-bounce">
                        {conv.unreadCount}
                      </span>
                    ) : (
                      // أيقونة سهم خفيفة تظهر عند حوم الماوس لجمالية إضافية في الـ UI
                      <span className="material-symbols-outlined text-[15px] text-[#b4aea5] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pl-0.5">
                        arrow_back_ios
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
