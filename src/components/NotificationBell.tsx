// src/components/NotificationBell.tsx — ✅ REDESIGNED
"use client";

import { useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/types/notification.types";

const ICONS: Record<Notification["type"], string> = {
  item_booked: "volunteer_activism",
  booking_cancelled: "cancel",
  waitlist_promoted: "notifications_active",
  delivery_done: "check_circle",
  new_rating: "star",
  report_resolved: "gavel",
  new_message: "chat",
};

// ألوان خلفية أيقونة كل نوع إشعار
const ICON_COLORS: Record<Notification["type"], string> = {
  item_booked:        "bg-primary/10 text-primary",
  booking_cancelled:  "bg-red-50 text-red-500",
  waitlist_promoted:  "bg-amber-50 text-amber-500",
  delivery_done:      "bg-emerald-50 text-emerald-500",
  new_rating:         "bg-yellow-50 text-yellow-500",
  report_resolved:    "bg-purple-50 text-purple-500",
  new_message:        "bg-sky-50 text-sky-500",
};

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    toggleOpen,
    handleMarkAllRead,
  } = useNotifications();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (isOpen) toggleOpen();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, toggleOpen]);

  return (
    <div ref={ref} className="relative">

      {/* ── زر الجرس ─────────────────────────────────────────── */}
      <button
        onClick={toggleOpen}
        aria-label="الإشعارات"
        aria-expanded={isOpen}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl
                    transition-all duration-200 active:scale-95
                    ${isOpen
                      ? "bg-primary/[0.08] text-primary"
                      : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    }`}
      >
        <span
          className={`material-symbols-outlined text-[21px] transition-transform
                      duration-300 ${isOpen ? "rotate-12" : ""}`}
          style={{
            fontVariationSettings: unreadCount > 0 ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          {unreadCount > 0 ? "notifications_active" : "notifications"}
        </span>

        {/* Badge عدد الإشعارات */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px]
                       animate-[badgePop_0.3s_ease-out] items-center justify-center
                       rounded-full bg-red-500 px-1 text-[9px] font-black
                       text-white shadow-sm"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Panel الإشعارات ────────────────────────────────────── */}
      <div
        dir="rtl"
        className={`absolute left-0 top-12 z-50 w-80 overflow-hidden rounded-2xl
                    border border-black/[0.07] bg-white shadow-xl shadow-black/[0.08]
                    transition-all duration-200 ease-out
                    ${isOpen
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-2 opacity-0"
                    }`}
      >

        {/* رأس الـ Panel */}
        <div
          className="flex items-center justify-between border-b border-black/[0.06]
                     bg-gradient-to-l from-primary/[0.04] to-transparent px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-gray-900">الإشعارات</span>
            {unreadCount > 0 && (
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full
                           bg-primary/10 px-1.5 text-[10px] font-black text-primary"
              >
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px]
                         font-bold text-primary transition-colors duration-150
                         hover:bg-primary/[0.07]"
            >
              <span className="material-symbols-outlined text-[13px]">done_all</span>
              تعليم الكل مقروءاً
            </button>
          )}
        </div>

        {/* قائمة الإشعارات */}
        <div className="max-h-[340px] overflow-y-auto">
          {isLoading ? (
            /* ── Skeleton Loader ── */
            <div className="divide-y divide-black/[0.04]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2 pt-0.5">
                    <div className="h-2.5 w-3/4 rounded-full bg-gray-100" />
                    <div className="h-2 w-full rounded-full bg-gray-100" />
                    <div className="h-2 w-1/2 rounded-full bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            /* ── Empty State ── */
            <div className="flex flex-col items-center gap-3 px-6 py-12">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl
                           bg-gray-50"
              >
                <span className="material-symbols-outlined text-[28px] text-gray-300">
                  notifications_off
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-500">لا توجد إشعارات</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  ستظهر إشعاراتك هنا عند وصولها
                </p>
              </div>
            </div>
          ) : (
            /* ── قائمة الإشعارات الحقيقية ── */
            <div className="divide-y divide-black/[0.04]">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex gap-3 px-4 py-3 transition-colors duration-150
                              ${!n.isRead
                                ? "bg-primary/[0.04] hover:bg-primary/[0.07]"
                                : "bg-white hover:bg-gray-50/80"
                              }`}
                >
                  {/* أيقونة نوع الإشعار */}
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center
                                rounded-full ${ICON_COLORS[n.type]}`}
                  >
                    <span
                      className="material-symbols-outlined text-[15px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {ICONS[n.type]}
                    </span>
                  </div>

                  {/* محتوى الإشعار */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[12.5px] leading-snug text-gray-800
                                  ${!n.isRead ? "font-black" : "font-semibold"}`}
                    >
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-gray-500">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString("ar-JO", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* مؤشر الغير مقروء */}
                  {!n.isRead && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer الـ Panel — فقط عند وجود إشعارات */}
        {!isLoading && notifications.length > 0 && (
          <div className="border-t border-black/[0.06] px-4 py-2.5 text-center">
            <span className="text-[11px] text-gray-400">
              {notifications.length} إشعار
            </span>
          </div>
        )}
      </div>

      {/* تعريف Animation الـ Badge — يُحقن مرة واحدة */}
      <style>{`
        @keyframes badgePop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}