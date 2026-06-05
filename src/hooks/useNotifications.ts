// src/hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "@/context/AuthContext";
import { getNotifications, markAllRead } from "@/lib/api/notificationApi";
import type { Notification } from "@/types/notification.types";

export function useNotifications() {
  const { user, isLoggedIn } = useAuth();
  const socketRef = useSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?._id || !isLoggedIn) return;

    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);

      const msgCount = data.notifications.filter(
        (n: Notification) => n.type === "new_message" && !n.isRead
      ).length;
      setUnreadMessages(msgCount);
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, isLoggedIn]);

  useEffect(() => {
    if (user?._id && isLoggedIn) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setUnreadMessages(0);
    }
  }, [user?._id, isLoggedIn, fetchNotifications]);

  useEffect(() => {
    if (!user?._id || !isLoggedIn) return;

    let detach: (() => void) | undefined;
    let stopped = false;

    const tryAttach = () => {
      const socket = socketRef.current;
      if (!socket) return false;

      const handleNew = (notification: Notification) => {
        setNotifications((prev) => {
          if (prev.some((n) => n._id === notification._id)) return prev;
          return [notification, ...prev];
        });

        setUnreadCount((prev) => prev + 1);

        if (notification.type === "new_message") {
          setUnreadMessages((prev) => prev + 1);
        }
      };

      socket.on("notification:new", handleNew);
      socket.on("connect", fetchNotifications);

      detach = () => {
        socket.off("notification:new", handleNew);
        socket.off("connect", fetchNotifications);
      };

      return true;
    };

    if (tryAttach()) {
      return () => {
        stopped = true;
        detach?.();
      };
    }

    const pollId = window.setInterval(() => {
      if (stopped) return;

      const attached = tryAttach();
      if (attached) {
        window.clearInterval(pollId);
      }
    }, 300);

    return () => {
      stopped = true;
      window.clearInterval(pollId);
      detach?.();
    };
  }, [user?._id, isLoggedIn, fetchNotifications, socketRef]);

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setUnreadMessages(0);

    try {
      await markAllRead();
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    toggleOpen,
    handleMarkAllRead,
    unreadMessages,
    setUnreadMessages,
  };
}