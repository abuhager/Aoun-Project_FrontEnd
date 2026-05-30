// src/hooks/useChat.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAccessToken } from '@/lib/api/axiosInstance';  // ✅ import هذا
import { useSocket } from './useSocket';
import type { ChatMessage, ConversationInfo } from '@/types/chat.types';

const API = process.env.NEXT_PUBLIC_API_URL!;

// ✅ يقرأ من الـ in-memory token — نفس ما يستخدمه axios
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function useChat(itemId: string) {
  const { user, isLoggedIn } = useAuth();
  const socketRef = useSocket();
  const convIdRef = useRef<string | null>(null);

  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [convInfo, setConvInfo]     = useState<ConversationInfo | null>(null);
  const [loading, setLoading]       = useState(false);
  const [sending, setSending]       = useState(false);
  const [text, setText]             = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const initConversation = useCallback(async () => {
    if (!user?._id || !isLoggedIn || !itemId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/conversations/${itemId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error(`Conversation init failed: ${res.status}`);

      const data: ConversationInfo = await res.json();
      convIdRef.current = data._id;
      setConvInfo(data);

      const msgsRes = await fetch(`${API}/api/conversations/${data._id}/messages`, {
        headers: getAuthHeaders(),
      });

      if (!msgsRes.ok) throw new Error(`Fetch messages failed: ${msgsRes.status}`);

      const msgsData = await msgsRes.json();
      setMessages(Array.isArray(msgsData.messages) ? msgsData.messages : []);

      socketRef.current?.emit('joinConversation', { itemId, convId: data._id });
    } catch (e) {
      console.error('useChat init error', e);
      convIdRef.current = null;
      setConvInfo(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, isLoggedIn, itemId, socketRef]);

  useEffect(() => {
    initConversation();
  }, [initConversation]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
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
      if (!convIdRef.current) return;
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
      socketRef.current?.emit('stopTyping', { convId });
    }
  }, [text, user?._id, initConversation, socketRef]);

  const markRead = useCallback(async () => {
    const convId = convIdRef.current;
    if (!convId) return;
    try {
      await fetch(`${API}/api/conversations/${convId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      socketRef.current?.emit('readMessages', { convId });
    } catch (err) {
      console.error('markRead error', err);
    }
  }, [socketRef]);

  const emitTyping = useCallback(() => {
    const convId = convIdRef.current;
    if (convId) socketRef.current?.emit('typing', { convId });
  }, [socketRef]);

  const emitStopTyping = useCallback(() => {
    const convId = convIdRef.current;
    if (convId) socketRef.current?.emit('stopTyping', { convId });
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