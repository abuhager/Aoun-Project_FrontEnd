// src/hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSocket }          from './useSocket';
import { useAuth }            from '@/context/AuthContext';
import { getNotifications, markAllRead } from '@/lib/api/notificationApi';
import type { Notification }  from '@/types/notification.types';

export function useNotifications() {
  const { user, isLoggedIn } = useAuth();
  const socketRef = useSocket();

  const [notifications,  setNotifications]  = useState<Notification[]>([]);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [isOpen,         setIsOpen]         = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?._id || !isLoggedIn) return;
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);

      // ✅ احسب unreadMessages عند التحميل
      const msgCount = data.notifications.filter(
        (n: Notification) => n.type === 'new_message' && !n.isRead
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
    const socket = socketRef.current;
    if (!socket) return;

    const handleNew = (notification: Notification) => {
      setNotifications(prev => {
        if (prev.some(n => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount(prev => prev + 1);

      // ✅ زد عداد الرسائل إذا كان new_message
      if (notification.type === 'new_message') {
        setUnreadMessages(prev => prev + 1);
      }
    };

    socket.on('notification:new', handleNew);
    return () => { socket.off('notification:new', handleNew); };
  }, [socketRef.current]);

  const handleMarkAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setUnreadMessages(0); // ✅ صفّر رسائل الـ chat
    try {
      await markAllRead();
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

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