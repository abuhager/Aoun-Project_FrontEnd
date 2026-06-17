"use client";
// HIGH-02 ► لا setInterval — socket:connect لاسترداد الفائت
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket }  from './useSocket';
import { useAuth }    from '@/context/AuthContext';
import { getNotifications, markAllRead } from '@/lib/api/notificationApi';
import type { Notification } from '@/types/notification.types';

export function useNotifications() {
  const { user, isLoggedIn } = useAuth();
  const socketRef = useSocket();
  const [notifications,  setNotifications]  = useState<Notification[]>([]);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [isOpen,         setIsOpen]         = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const attachedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?._id || !isLoggedIn) return;
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setUnreadMessages(data.notifications.filter((n: Notification) => n.type === 'new_message' && !n.isRead).length);
    } catch {} finally { setIsLoading(false); }
  }, [user?._id, isLoggedIn]);

  useEffect(() => {
    if (user?._id && isLoggedIn) fetchNotifications();
    else { setNotifications([]); setUnreadCount(0); setUnreadMessages(0); }
  }, [user?._id, isLoggedIn, fetchNotifications]);

  useEffect(() => {
    if (!user?._id || !isLoggedIn) return;
    let detach: (() => void) | undefined;
    const attach = () => {
      const s = socketRef.current; if (!s || attachedRef.current) return false;
      const onNew = (n: Notification) => {
        setNotifications((p) => { if (p.some((x) => x._id === n._id)) return p; return [n, ...p]; });
        setUnreadCount((p) => p + 1);
        if (n.type === 'new_message') setUnreadMessages((p) => p + 1);
      };
      s.on('notification:new', onNew);
      s.on('connect',          fetchNotifications);
      attachedRef.current = true;
      detach = () => { s.off('notification:new', onNew); s.off('connect', fetchNotifications); attachedRef.current = false; };
      return true;
    };
    if (attach()) return () => detach?.();
    const t = setTimeout(() => { if (!attachedRef.current) attach(); }, 500);
    return () => { clearTimeout(t); detach?.(); };
  }, [user?._id, isLoggedIn, fetchNotifications, socketRef]);

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0); setUnreadMessages(0);
    try { await markAllRead(); } catch { fetchNotifications(); }
  }, [fetchNotifications]);

  return { notifications, unreadCount, isOpen, isLoading, toggleOpen: () => setIsOpen((p) => !p), handleMarkAllRead, unreadMessages, setUnreadMessages };
}
