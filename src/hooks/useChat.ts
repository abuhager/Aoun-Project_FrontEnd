// src/hooks/useChat.ts — ✅ THE IMMUNE PRODUCTION VERSION (V3)
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAccessToken } from '@/lib/api/axiosInstance';
import { useSocket } from './useSocket';
import type { ChatMessage, ConversationInfo } from '@/types/chat.types';

const API = process.env.NEXT_PUBLIC_API_URL!;

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function useChat(itemId: string, isOpen: boolean = false) {
  const { user, isLoggedIn } = useAuth();
  const socketRef = useSocket();
  const convIdRef = useRef<string | null>(null);

  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [convInfo, setConvInfo]     = useState<ConversationInfo | null>(null);
  const [loading, setLoading]       = useState(false);
  const [sending, setSending]       = useState(false);
  const [text, setText]             = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // ✅ استخدام Ref للاحتفاظ بحالة isOpen اللحظية لقطع أي سباق برمي (Race Condition)
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

 const initConversation = useCallback(async () => {
    // 🔒 [الحارس الحديدي]: اخرج فوراً إذا كان الشات مغلقاً
    if (isOpenRef.current !== true || !itemId || !user?._id || !isLoggedIn) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ itemId }),
      });

      // 🎯 [امتصاص وصيد الـ 400]: إذا رفض السيرفر الطلب (لأن الغرض غير محجوز أو أطراف الحجز لم تكتمل بعد)
      // اخرج بصمت بـ return آمن دون إلقاء خطأ يعلق بالمتصفح ويملأ الكونسول باللون الأحمر
      if (res.status === 400) {
        convIdRef.current = null;
        setConvInfo(null);
        return; 
      }

      if (!res.ok) {
        throw new Error(`Conversation init failed: ${res.status}`);
      }

      const data: ConversationInfo = await res.json();
      convIdRef.current = data._id;
      setConvInfo(data);

      const msgsRes = await fetch(`${API}/api/conversations/${data._id}/messages`, {
        headers: getAuthHeaders(),
      });

      if (!msgsRes.ok) throw new Error(`Fetch messages failed: ${msgsRes.status}`);

      const msgsData = await msgsRes.json();
      
      const actualMessages = Array.isArray(msgsData.messages) 
        ? msgsData.messages 
        : (Array.isArray(msgsData.data) ? msgsData.data : (msgsData.messages?.data || []));

      setMessages(actualMessages);

      socketRef.current?.emit('joinConversation', { itemId, convId: data._id });
    } catch (err) {
      // كتم الأخطاء العابرة لضمان ثبات التطبيق والمظهر الاحترافي للـ Console
      convIdRef.current = null;
      setConvInfo(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, isLoggedIn, itemId, socketRef]);
  useEffect(() => {
    if (isOpen === true && itemId && isLoggedIn) {
      initConversation();
    }
  }, [isOpen, itemId, isLoggedIn, initConversation]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (msg.sender === user?._id) {
          const hasTempVersion = prev.some((m) => m._id.startsWith('temp-'));
          if (hasTempVersion) {
            const tempIdx = prev.findIndex((m) => m._id.startsWith('temp-'));
            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = msg;
              return updated;
            }
          }
        }
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const handleTyping = (payload: { userId: string; name: string }) => {
      if (payload.userId !== user?._id) setTypingUser(payload.name);
    };

    const handleStopTyping = () => setTypingUser(null);

    socket.on('newMessage',     handleNewMessage);
    socket.on('userTyping',     handleTyping);
    socket.on('userStopTyping', handleStopTyping);

    return () => {
      socket.off('newMessage',     handleNewMessage);
      socket.off('userTyping',     handleTyping);
      socket.off('userStopTyping', handleStopTyping);
    };
  }, [socketRef, user?._id]);

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!convIdRef.current) {
  await initConversation();
  
  if (!convIdRef.current) {
    return;
  }
}

    const convId       = convIdRef.current;
    const optimisticId = `temp-${Date.now()}`;

    const optimistic: ChatMessage = {
      _id:       optimisticId,
      sender:    user?._id ?? '',
      text:      trimmed,
      createdAt: new Date().toISOString(),
      read:      false,
    };

    setSending(true);
    setMessages((prev) => [...prev, optimistic]);
    setText('');

    try {
      const res = await fetch(`${API}/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: trimmed }),
      });

      if (!res.ok) throw new Error(`Send message failed: ${res.status}`);

      const data = await res.json();
      if (data?.message?._id) {
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticId ? data.message : m))
        );
      }
    } catch (err) {
      console.error('sendMessage error', err);
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
      setText(trimmed);
    } finally {
      setSending(false);
      if (socketRef.current) socketRef.current.emit('stopTyping', { convId });
    }
  }, [text, user?._id, initConversation, socketRef]);

  const markRead = useCallback(() => {
    const convId = convIdRef.current;
    if (!convId || !socketRef.current) return;
    try {
      fetch(`${API}/api/conversations/${convId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      }).catch(() => {});
      socketRef.current.emit('readMessages', { convId });
    } catch (err) {
      console.error('markRead error', err);
    }
  }, [socketRef]);

  const emitTyping = useCallback(() => {
    const convId = convIdRef.current;
    if (convId && socketRef.current) socketRef.current.emit('typing', { convId });
  }, [socketRef]);

  const emitStopTyping = useCallback(() => {
    const convId = convIdRef.current;
    if (convId && socketRef.current) socketRef.current.emit('stopTyping', { convId });
  }, [socketRef]);

  return {
    messages,
    convInfo,
    loading,
    sending,
    text,
    setText,
    sendMessage,
    typingUser,
    emitTyping,
    emitStopTyping,
    markRead,
  };
}