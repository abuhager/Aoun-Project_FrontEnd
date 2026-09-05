"use client";

import type { NotificationBellController } from "./useNotificationBellController";

type NotificationButtonProps = Pick<NotificationBellController, "buttonRef" | "panelId" | "isOpen" | "unreadCount" | "toggleOpen">;

export default function NotificationButton({ buttonRef, panelId, isOpen, unreadCount, toggleOpen }: NotificationButtonProps) {
  return (
    <button ref={buttonRef} type="button" onClick={toggleOpen} aria-label={`الإشعارات${unreadCount > 0 ? `، ${unreadCount} غير مقروء` : ""}`} aria-expanded={isOpen} aria-controls={panelId} aria-haspopup="true" className={`touch-target relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 active:scale-95 ${isOpen ? "bg-primary/[0.08] text-primary" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
      <span className={`material-symbols-outlined text-[21px] transition-transform duration-300 ${isOpen ? "rotate-12" : ""}`} style={{ fontVariationSettings: unreadCount > 0 ? "'FILL' 1" : "'FILL' 0" }}>
        {unreadCount > 0 ? "notifications_active" : "notifications"}
      </span>
      {unreadCount > 0 && <span aria-live="polite" className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] animate-[badgePop_0.3s_ease-out] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-sm">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </button>
  );
}
