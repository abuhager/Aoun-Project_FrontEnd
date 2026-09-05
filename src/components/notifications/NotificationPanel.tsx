"use client";

import type { Notification } from "@/types/notification.types";
import { formatNotificationDate, NOTIFICATION_ICON_COLORS, NOTIFICATION_ICONS } from "./notificationPresentation";
import type { NotificationBellController } from "./useNotificationBellController";

type NotificationPanelProps = Pick<NotificationBellController, "panelId" | "notifications" | "unreadCount" | "totalCount" | "hasMore" | "isLoading" | "error" | "refresh" | "handleMarkAllRead" | "handleNotificationClick">;

function NotificationItem({ notification, onClick }: { notification: Notification; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full gap-3 px-4 py-3 text-right transition-colors duration-150 ${!notification.isRead ? "bg-primary/[0.04] hover:bg-primary/[0.07]" : "bg-white hover:bg-gray-50/80"}`}>
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${NOTIFICATION_ICON_COLORS[notification.type] ?? "bg-gray-100 text-gray-500"}`}>
        <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>{NOTIFICATION_ICONS[notification.type] ?? "notifications"}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[12.5px] leading-snug text-gray-800 ${!notification.isRead ? "font-black" : "font-semibold"}`}>{notification.title}</p>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-gray-500">{notification.body}</p>
        <p className="mt-1 text-[10px] text-gray-400">{formatNotificationDate(notification.createdAt)}</p>
      </div>
      {!notification.isRead && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </button>
  );
}

function LoadingState() {
  return <div className="divide-y divide-black/[0.04]">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="flex animate-pulse gap-3 px-4 py-3"><div className="h-8 w-8 shrink-0 rounded-full bg-gray-100" /><div className="flex-1 space-y-2 pt-0.5"><div className="h-2.5 w-3/4 rounded-full bg-gray-100" /><div className="h-2 w-full rounded-full bg-gray-100" /><div className="h-2 w-1/2 rounded-full bg-gray-100" /></div></div>)}</div>;
}

export default function NotificationPanel({ panelId, notifications, unreadCount, totalCount, hasMore, isLoading, error, refresh, handleMarkAllRead, handleNotificationClick }: NotificationPanelProps) {
  return (
    <div id={panelId} dir="rtl" role="region" aria-label="قائمة الإشعارات" className="fixed left-2 right-2 top-20 z-50 max-h-[calc(100dvh-6rem)] overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-xl shadow-black/[0.08] md:absolute md:left-0 md:right-auto md:top-12 md:w-80">
      <div className="flex items-center justify-between border-b border-black/[0.06] bg-gradient-to-l from-primary/[0.04] to-transparent px-4 py-3">
        <div className="flex items-center gap-2"><span className="text-sm font-black text-gray-900">الإشعارات</span>{unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-black text-primary">{unreadCount}</span>}</div>
        {unreadCount > 0 && <button onClick={handleMarkAllRead} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-primary transition-colors duration-150 hover:bg-primary/[0.07]"><span className="material-symbols-outlined text-[13px]">done_all</span>تعليم الكل مقروءاً</button>}
      </div>

      <div className="max-h-[340px] overflow-y-auto">
        {error && notifications.length > 0 && <div role="status" className="flex items-center justify-between gap-2 border-b border-red-100 bg-red-50 px-4 py-2 text-[11px] font-bold text-red-600"><span>{error}</span><button type="button" onClick={() => void refresh()} className="shrink-0 underline underline-offset-2">إعادة المحاولة</button></div>}
        {isLoading ? <LoadingState /> : error && notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10"><span className="material-symbols-outlined text-[30px] text-red-300">cloud_off</span><p role="alert" className="text-sm font-bold text-red-600">{error}</p><button type="button" onClick={() => void refresh()} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90">إعادة المحاولة</button></div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50"><span className="material-symbols-outlined text-[28px] text-gray-300">notifications_off</span></div><div className="text-center"><p className="text-sm font-bold text-gray-500">لا توجد إشعارات</p><p className="mt-0.5 text-xs text-gray-400">ستظهر إشعاراتك هنا عند وصولها</p></div></div>
        ) : <div className="divide-y divide-black/[0.04]">{notifications.map((notification) => <NotificationItem key={notification._id} notification={notification} onClick={() => handleNotificationClick(notification)} />)}</div>}
      </div>

      {!isLoading && notifications.length > 0 && <div className="border-t border-black/[0.06] px-4 py-2.5 text-center"><span className="text-[11px] text-gray-400">{hasMore ? `عرض آخر ${notifications.length} من ${totalCount} إشعار` : `${totalCount} إشعار`}</span></div>}
    </div>
  );
}
