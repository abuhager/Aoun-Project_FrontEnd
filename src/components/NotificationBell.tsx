// src/components/NotificationBell.tsx
"use client";

import { useRef, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/types/notification.types';

// أيقونة لكل نوع إشعار
const ICONS: Record<Notification['type'], string> = {
  item_booked:       'volunteer_activism',
  booking_cancelled: 'cancel',
  waitlist_promoted: 'notifications_active',
  delivery_done:     'check_circle',
  new_rating:        'star',
  report_resolved:   'gavel',
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

  // إغلاق عند الضغط خارج الـ dropdown
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (isOpen) toggleOpen();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, toggleOpen]);

  return (
    <div ref={ref} className="relative">
      {/* ─── زر الجرس ─── */}
      <button
        onClick={toggleOpen}
        aria-label="الإشعارات"
        className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <span className="material-symbols-outlined text-xl text-gray-600">
          {unreadCount > 0 ? 'notifications_active' : 'notifications'}
        </span>

        {/* Badge عدد الغير مقروءة */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ─── Dropdown ─── */}
      {isOpen && (
        <div
          dir="rtl"
          className="absolute left-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-black text-sm text-gray-800">الإشعارات</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary font-bold hover:underline"
              >
                تعليم الكل مقروءاً
              </button>
            )}
          </div>

          {/* القائمة */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {isLoading ? (
              // Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                <span className="material-symbols-outlined text-4xl">notifications_off</span>
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex gap-3 px-4 py-3 transition-colors ${
                    n.isRead ? 'bg-white' : 'bg-primary/5'
                  }`}
                >
                  {/* أيقونة النوع */}
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-sm">
                      {ICONS[n.type]}
                    </span>
                  </div>

                  {/* المحتوى */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold text-gray-800 ${!n.isRead ? 'font-black' : ''}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('ar-JO', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* نقطة غير مقروء */}
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}