"use client";
// HIGH-01 ► correlationId | MED-03 ► socket يحمل الرسائل
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth }        from '@/context/AuthContext';
import { getAccessToken } from '@/lib/api/axiosInstance';
import { useSocket }      from './useSocket';
import type { ChatMessage, ConversationInfo } from '@/types/chat.types';

const API = process.env.NEXT_PUBLIC_API_URL!;
const h = (): HeadersInit => { const t = getAccessToken(); return { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }; };

export function useChat(itemId: string, isOpen = false) {
  const { user, isLoggedIn } = useAuth();
  const socketRef = useSocket();
  const convIdRef = useRef<string | null>(null);
  const isOpenRef = useRef(isOpen);
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
      const res = await fetch(API + '/api/conversations', { method: 'POST', headers: h(), body: JSON.stringify({ itemId }) });
      if (res.status === 400) { convIdRef.current = null; setConvInfo(null); return; }
      if (!res.ok) throw new Error();
      const data: ConversationInfo = await res.json();
      convIdRef.current = data._id;
      setConvInfo(data);
      socketRef.current?.emit('joinConversation', { itemId, convId: data._id });
    } catch { convIdRef.current = null; setConvInfo(null); setMessages([]); }
    finally { setLoading(false); }
  }, [user?._id, isLoggedIn, itemId, socketRef]);

  useEffect(() => { if (isOpen && itemId && isLoggedIn) initConversation(); }, [isOpen, itemId, isLoggedIn, initConversation]);

  useEffect(() => {
    const s = socketRef.current; if (!s) return;
    const onJoined = ({ convId, messages: msgs }: { convId: string; messages: ChatMessage[] }) => { convIdRef.current = convId; setMessages(msgs || []); setLoading(false); };
    const onMsg = (msg: ChatMessage & { correlationId?: string }) => {
      setMessages((prev) => {
        if (msg.correlationId) { const i = prev.findIndex((m) => m._id === msg.correlationId); if (i !== -1) { const u = [...prev]; u[i] = { ...msg }; return u; } }
        if (msg.sender === user?._id) { const ti = prev.findIndex((m) => m._id.startsWith('temp-')); if (ti !== -1) { const u = [...prev]; u[ti] = { ...msg }; return u; } }
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    s.on('conversationJoined', onJoined);
    s.on('newMessage',         onMsg);
    s.on('userTyping',         (p: { userId: string; name: string }) => { if (p.userId !== user?._id) setTypingUser(p.name); });
    s.on('userStopTyping',     () => setTypingUser(null));
    s.on('messagesRead',       ({ by }: { by: string }) => { if (by !== user?._id) setMessages((p) => p.map((m) => ({ ...m, read: true }))); });
    return () => { s.off('conversationJoined', onJoined); s.off('newMessage', onMsg); s.off('userTyping'); s.off('userStopTyping'); s.off('messagesRead'); };
  }, [socketRef, user?._id]);

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim(); if (!trimmed) return;
    if (!convIdRef.current) { await initConversation(); if (!convIdRef.current) return; }
    const convId = convIdRef.current;
    const correlationId = 'temp-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    const optimistic: ChatMessage = { _id: correlationId, sender: user?._id ?? '', text: trimmed, createdAt: new Date().toISOString(), read: false };
    setSending(true); setMessages((p) => [...p, optimistic]); setText('');
    try {
      const res = await fetch(API + '/api/conversations/' + convId + '/messages', { method: 'POST', headers: h(), body: JSON.stringify({ text: trimmed, correlationId }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data?.message?._id) setMessages((p) => p.map((m) => m._id === correlationId ? { ...data.message, correlationId } : m));
    } catch { setMessages((p) => p.filter((m) => m._id !== correlationId)); setText(trimmed); }
    finally { setSending(false); socketRef.current?.emit('stopTyping', { convId }); }
  }, [text, user?._id, initConversation, socketRef]);

  const markRead       = useCallback(() => { const c = convIdRef.current; if (!c) return; fetch(API + '/api/conversations/' + c + '/read', { method: 'PUT', headers: h() }).catch(() => {}); socketRef.current?.emit('readMessages', { convId: c }); }, [socketRef]);
  const emitTyping     = useCallback(() => { const c = convIdRef.current; if (c) socketRef.current?.emit('typing',     { convId: c }); }, [socketRef]);
  const emitStopTyping = useCallback(() => { const c = convIdRef.current; if (c) socketRef.current?.emit('stopTyping', { convId: c }); }, [socketRef]);

  return { messages, convInfo, loading, sending, text, setText, sendMessage, typingUser, emitTyping, emitStopTyping, markRead };
}
