'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth }   from '@/context/AuthContext';
import { useSocket } from './useSocket';
import axiosInstance from '@/lib/api/axiosInstance';
import type { ChatMessage, ConversationInfo } from '@/types/chat.types';

// تعديل واجهة الاستجابة لتشمل الرسائل القادمة من الباكيند
interface ConversationResponse extends ConversationInfo {
  messages?: ChatMessage[];
}

export function useChat(itemId: string, isOpen = false) {
  const { user, isLoggedIn } = useAuth();
  const socketRef  = useSocket();
  const convIdRef  = useRef<string | null>(null);
  const isOpenRef  = useRef(isOpen);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  const [messages,   setMessages]   = useState<ChatMessage[]>([]);
  const [convInfo,   setConvInfo]   = useState<ConversationInfo | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [sending,    setSending]    = useState(false);
  const [text,       setText]       = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const initConversation = useCallback(async () => {
    if (!isOpenRef.current || !itemId || !user?._id || !isLoggedIn) return;
    setLoading(true);
    try {
      // ضرب الـ API لجلب أو فتح المحادثة (الباكيند المطور يرجع كائن المحادثة كامل)
      const { data } = await axiosInstance.post<ConversationResponse>(
        '/api/conversations',
        { itemId }
      );
      
      convIdRef.current = data._id;
      setConvInfo({ _id: data._id, item: data.item });

      // 🔥 [الإصلاح السحري]: حقن الرسائل القديمة (التاريخية) القادمة من الداتابيز فوراً في الـ State
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }

      // إخطار السوكيت بالانضمام للغرفة التاريخية الصحيحة للمحادثة
      socketRef.current?.emit('joinConversation', { itemId, convId: data._id });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 400) console.error('[useChat] initConversation error:', err);
      convIdRef.current = null;
      setConvInfo(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, isLoggedIn, itemId, socketRef]);

  useEffect(() => {
    if (isOpen && itemId && isLoggedIn) initConversation();
  }, [isOpen, itemId, isLoggedIn, initConversation]);

  const sendMessage = useCallback(async () => {
    if (!text.trim() || !convIdRef.current || sending) return;
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      _id: tempId, 
      sender: user?._id ?? '', // سيتم عرضها كـ "أنت" في الشاشة بناءً على المقارنة
      text: text.trim(), 
      createdAt: new Date().toISOString(), 
      read: false,
    };
    setMessages((p) => [...p, tempMsg]);
    setText('');
    setSending(true);
    try {
      await axiosInstance.post(
        `/api/conversations/${convIdRef.current}/messages`,
        { text: tempMsg.text }
      );
    } catch {
      setMessages((p) => p.filter((m) => m._id !== tempId));
      setText(tempMsg.text);
    } finally {
      setSending(false);
    }
  }, [text, convIdRef, sending, user?._id]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const onMsg = (msg: ChatMessage & { correlationId?: string }) => {
      setMessages((prev) => {
        if (msg.correlationId) {
          const i = prev.findIndex((m) => m._id === msg.correlationId);
          if (i !== -1) { const u = [...prev]; u[i] = { ...msg }; return u; }
        }
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    const onTyping = (d: { userId: string; name: string }) => {
      if (d.userId === user?._id) return;
      setTypingUser(d.name);
      setTimeout(() => setTypingUser(null), 2500);
    };
    s.on('message:new', onMsg);
    s.on('user:typing', onTyping);
    return () => { s.off('message:new', onMsg); s.off('user:typing', onTyping); };
  }, [socketRef, user?._id]);

  const sendTyping = useCallback(() => {
    if (!convIdRef.current) return;
    socketRef.current?.emit('typing', { convId: convIdRef.current });
  }, [socketRef]);

  return { messages, convInfo, loading, sending, text, setText, typingUser, sendMessage, sendTyping };
}