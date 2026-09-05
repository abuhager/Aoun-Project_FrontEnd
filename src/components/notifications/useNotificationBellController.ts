"use client";

import { useEffect, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSafeRedirectPath } from "@/config/routes";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/types/notification.types";

export function useNotificationBellController() {
  const router = useRouter();
  const notificationsState = useNotifications();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { isOpen, close, handleMarkOneRead } = notificationsState;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        if (isOpen) close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [close, isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    void handleMarkOneRead(notification);
    if (notification.type === "new_message" && notification.conversationId) {
      close();
      window.dispatchEvent(new CustomEvent("aoun:open-conversation", {
        detail: { conversationId: notification.conversationId },
      }));
      return;
    }

    const destination = notification.actionUrl
      ?? (notification.itemId ? `/items/${notification.itemId}` : null);
    const safeDestination = getSafeRedirectPath(destination, "");
    if (safeDestination) {
      close();
      router.push(safeDestination);
    }
  };

  return {
    ...notificationsState,
    rootRef,
    buttonRef,
    panelId,
    handleNotificationClick,
  };
}

export type NotificationBellController = ReturnType<typeof useNotificationBellController>;
