// src/hooks/useNotifications.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { SOCKET_EVENTS } from '@/config/socket';
import { useAuth }   from '@/context/AuthContext';
import { getNotifications, markAllRead, markOneRead } from '@/lib/api/notificationApi';
import type { Notification } from '@/types/notification.types';

export function useNotifications() {
  const { user, isLoggedIn } = useAuth();
  const { socket } = useSocket(); // 👈 Fixed: Destructured socket directly instead of acting like it's a Ref

  const [notifications,  setNotifications]  = useState<Notification[]>([]);
  const [unreadCount,    setUnreadCount]     = useState(0);
  const [isOpen,         setIsOpen]          = useState(false);
  const [isLoading,      setIsLoading]       = useState(false);
  const [unreadMessages, setUnreadMessages]  = useState(0);

  const isMountedRef = useRef(true); 

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user?._id || !isLoggedIn || !isMountedRef.current) return;
    setIsLoading(true);
    try {
      const data = await getNotifications();
      if (!isMountedRef.current) return; 
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setUnreadMessages(
        data.notifications.filter((n: Notification) => n.type === 'new_message' && !n.isRead).length
      );
    } catch { /* silent */ } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [user?._id, isLoggedIn]);

  useEffect(() => {
    if (user?._id && isLoggedIn) fetchNotifications();
    else { setNotifications([]); setUnreadCount(0); setUnreadMessages(0); }
  }, [user?._id, isLoggedIn, fetchNotifications]);

  useEffect(() => {
    if (!user?._id || !isLoggedIn || !socket) return;

    const onNew = (notification: Notification) => {
      if (!isMountedRef.current) return;
      setNotifications((current) => (
        current.some((item) => item._id === notification._id)
          ? current
          : [notification, ...current]
      ));
      setUnreadCount((current) => current + 1);
      if (notification.type === 'new_message') {
        setUnreadMessages((current) => current + 1);
      }
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, onNew);
    socket.on(SOCKET_EVENTS.NOTIFICATION_REFRESH, fetchNotifications);
    socket.on('connect', fetchNotifications);
    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, onNew);
      socket.off(SOCKET_EVENTS.NOTIFICATION_REFRESH, fetchNotifications);
      socket.off('connect', fetchNotifications);
    };
  }, [user?._id, isLoggedIn, fetchNotifications, socket]);

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setUnreadMessages(0);
    try { await markAllRead(); }
    catch { fetchNotifications(); }
  }, [fetchNotifications]);

  const handleMarkOneRead = useCallback(async (notification: Notification) => {
    if (notification.isRead) return;
    setNotifications((current) => current.map((item) =>
      item._id === notification._id ? { ...item, isRead: true } : item
    ));
    setUnreadCount((current) => Math.max(0, current - 1));
    if (notification.type === 'new_message') {
      setUnreadMessages((current) => Math.max(0, current - 1));
    }
    try { await markOneRead(notification._id); }
    catch { void fetchNotifications(); }
  }, [fetchNotifications]);

  return {
    notifications, unreadCount, isOpen, isLoading, unreadMessages,
    setUnreadMessages,
    toggleOpen: () => setIsOpen((p) => !p),
    handleMarkAllRead,
    handleMarkOneRead,
  };
}
