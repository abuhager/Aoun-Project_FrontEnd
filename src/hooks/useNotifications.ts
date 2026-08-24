'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { SOCKET_EVENTS } from '@/config/socket';
import { useAuth } from '@/context/AuthContext';
import {
  getNotifications,
  markAllRead,
  markOneRead,
} from '@/lib/api/notificationApi';
import type { Notification } from '@/types/notification.types';

const NOTIFICATION_LIMIT = 20;

export function useNotifications() {
  const { user, isLoggedIn } = useAuth();
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const hasLoadedRef = useRef(false);
  const requestSequenceRef = useRef(0);
  const seenIdsRef = useRef(new Set<string>());

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      requestSequenceRef.current += 1;
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user?._id || !isLoggedIn || !isMountedRef.current) return;

    const requestId = ++requestSequenceRef.current;
    if (!hasLoadedRef.current) setIsLoading(true);
    setError(null);

    try {
      const data = await getNotifications(NOTIFICATION_LIMIT);
      if (
        !isMountedRef.current
        || requestId !== requestSequenceRef.current
      ) {
        return;
      }

      seenIdsRef.current = new Set(
        data.notifications.map((notification) => notification._id),
      );
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setTotalCount(data.totalCount);
      setHasMore(data.hasMore);
      hasLoadedRef.current = true;
    } catch {
      if (
        isMountedRef.current
        && requestId === requestSequenceRef.current
      ) {
        setError('تعذر تحميل الإشعارات');
      }
    } finally {
      if (
        isMountedRef.current
        && requestId === requestSequenceRef.current
      ) {
        setIsLoading(false);
      }
    }
  }, [user?._id, isLoggedIn]);

  useEffect(() => {
    if (user?._id && isLoggedIn) {
      void fetchNotifications();
      return;
    }

    requestSequenceRef.current += 1;
    seenIdsRef.current.clear();
    hasLoadedRef.current = false;
    setNotifications([]);
    setUnreadCount(0);
    setTotalCount(0);
    setHasMore(false);
    setIsOpen(false);
    setError(null);
  }, [user?._id, isLoggedIn, fetchNotifications]);

  useEffect(() => {
    if (!user?._id || !isLoggedIn || !socket) return;

    const onNew = (notification: Notification) => {
      if (
        !isMountedRef.current
        || !notification?._id
        || seenIdsRef.current.has(notification._id)
      ) {
        return;
      }

      if (seenIdsRef.current.size >= NOTIFICATION_LIMIT) {
        setHasMore(true);
      }
      seenIdsRef.current.add(notification._id);
      setNotifications((current) =>
        [notification, ...current].slice(0, NOTIFICATION_LIMIT)
      );
      setTotalCount((current) => current + 1);
      if (!notification.isRead) {
        setUnreadCount((current) => current + 1);
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
    setNotifications((current) => current.map((notification) => ({
      ...notification,
      isRead: true,
    })));
    setUnreadCount(0);
    setError(null);

    try {
      await markAllRead();
    } catch {
      setError('تعذر تعليم الإشعارات مقروءة');
      await fetchNotifications();
    }
  }, [fetchNotifications]);

  const handleMarkOneRead = useCallback(async (
    notification: Notification,
  ) => {
    if (notification.isRead) return;

    setNotifications((current) => current.map((item) =>
      item._id === notification._id ? { ...item, isRead: true } : item
    ));
    setUnreadCount((current) => Math.max(0, current - 1));
    setError(null);

    try {
      await markOneRead(notification._id);
    } catch {
      setError('تعذر تحديث الإشعار');
      await fetchNotifications();
    }
  }, [fetchNotifications]);

  const toggleOpen = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    notifications,
    unreadCount,
    totalCount,
    hasMore,
    isOpen,
    isLoading,
    error,
    toggleOpen,
    close,
    refresh: fetchNotifications,
    handleMarkAllRead,
    handleMarkOneRead,
  };
}
