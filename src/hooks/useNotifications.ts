// src/hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useAuth } from '@/context/AuthContext';
import { getNotifications, markAllRead } from '@/lib/api/notificationApi';
import type { Notification } from '@/types/notification.types';

export function useNotifications() {
  const { user, isLoggedIn } = useAuth(); // ✅ أضف isLoggedIn
  const socketRef = useSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [isOpen,        setIsOpen]        = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);

  // ✅ isLoggedIn في الـ deps
  const fetchNotifications = useCallback(async () => {
    if (!user?._id || !isLoggedIn) return;
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, isLoggedIn]);

  // ✅ يطلب البيانات فقط لو مسجل دخول
  useEffect(() => {
    if (user?._id && isLoggedIn) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?._id, isLoggedIn, fetchNotifications]);

  // استقبال Real-time
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNew = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('notification:new', handleNew);
    return () => { socket.off('notification:new', handleNew); };
  }, [socketRef.current]);

  // تعليم الكل مقروء — Optimistic UI
  const handleMarkAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllRead();
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    toggleOpen,
    handleMarkAllRead,
  };
}