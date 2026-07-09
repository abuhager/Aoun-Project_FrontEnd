// src/hooks/useNotifications.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth }   from '@/context/AuthContext';
import { getNotifications, markAllRead } from '@/lib/api/notificationApi';
import type { Notification } from '@/types/notification.types';

export function useNotifications() {
  const { user, isLoggedIn } = useAuth();
  const { socket } = useSocket(); // 👈 Fixed: Destructured socket directly instead of acting like it's a Ref

  const [notifications,  setNotifications]  = useState<Notification[]>([]);
  const [unreadCount,    setUnreadCount]     = useState(0);
  const [isOpen,         setIsOpen]          = useState(false);
  const [isLoading,      setIsLoading]       = useState(false);
  const [unreadMessages, setUnreadMessages]  = useState(0);

  const attachedRef  = useRef(false);
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
    if (!user?._id || !isLoggedIn || !socket) return; // 👈 Ensure socket is defined
    let cancelled = false;

    const tryAttach = () => {
      if (attachedRef.current || cancelled) return undefined;
      
      const onNew = (n: Notification) => {
        if (!isMountedRef.current) return;
        setNotifications((p) => p.some((x) => x._id === n._id) ? p : [n, ...p]);
        setUnreadCount((p) => p + 1);
        if (n.type === 'new_message') setUnreadMessages((p) => p + 1);
      };

      socket.on('notification:new', onNew);
      socket.on('connect', fetchNotifications);
      attachedRef.current = true;

      return () => {
        socket.off('notification:new', onNew);
        socket.off('connect', fetchNotifications);
        attachedRef.current = false;
      };
    };

    const detach = tryAttach();
    if (detach) return () => { cancelled = true; detach(); };

    const t = setTimeout(() => { if (!cancelled) tryAttach(); }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
      if (attachedRef.current) {
        socket.off('notification:new');
        socket.off('connect', fetchNotifications);
        attachedRef.current = false;
      }
    };
  }, [user?._id, isLoggedIn, fetchNotifications, socket]); // 👈 Added stable socket to dependencies

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setUnreadMessages(0);
    try { await markAllRead(); }
    catch { fetchNotifications(); }
  }, [fetchNotifications]);

  return {
    notifications, unreadCount, isOpen, isLoading, unreadMessages,
    setUnreadMessages,
    toggleOpen: () => setIsOpen((p) => !p),
    handleMarkAllRead,
  };
}