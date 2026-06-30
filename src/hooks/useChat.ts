"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth }   from "@/context/AuthContext";
import { useSocket } from "./useSocket";
import axiosInstance from "@/lib/api/axiosInstance";
import type { ChatMessage, ConversationInfo } from "@/types/chat.types";

interface ConversationResponse extends ConversationInfo {
  messages?: ChatMessage[];
}

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
  const [text,       setText]       = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // ─── فتح / جلب المحادثة ───────────────────────────────────────────────────
  const initConversation = useCallback(async () => {
    if (!isOpenRef.current || !itemId || !user?._id || !isLoggedIn) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.post<ConversationResponse>(
        "/api/conversations",
        { itemId }
      );

      convIdRef.current = data._id;
      setConvInfo({ _id: data._id, item: data.item });
      setMessages(Array.isArray(data.messages) ? data.messages : []);

      // [FIX] الباكيند ينضم على user_${id} — نُعلمه بالغرفة الصحيحة
      socketRef.current?.emit("joinConversation", {
        itemId,
        convId: data._id,
      });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 400) console.error("[useChat] initConversation error:", err);
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

  // ─── إرسال رسالة ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!text.trim() || !convIdRef.current || sending) return;
    const tempId  = `temp-${Date.now()}`;
    const trimmed = text.trim();

    const tempMsg: ChatMessage = {
      _id:       tempId,
      sender:    user?._id ?? "",
      text:      trimmed,
      createdAt: new Date().toISOString(),
      read:      false,
    };

    setMessages((p) => [...p, tempMsg]);
    setText("");
    setSending(true);

    try {
      await axiosInstance.post(
        `/api/conversations/${convIdRef.current}/messages`,
        { text: trimmed }
      );
      // الرسالة الحقيقية ستصل عبر socket message:new وتستبدل الـ tempMsg
    } catch {
      setMessages((p) => p.filter((m) => m._id !== tempId));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }, [text, sending, user?._id]);

  // ─── استقبال رسائل الـ Socket ─────────────────────────────────────────────
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    // [FIX] استقبال message:new وإزالة الـ tempMsg المقابل
    const onMsg = (payload: { conversationId?: string; message: ChatMessage & { correlationId?: string } }) => {
      // دعم الصيغتين: { message } أو الرسالة مباشرةً
      const msg = (payload as { message?: ChatMessage & { correlationId?: string } }).message ?? payload as unknown as ChatMessage;

      setMessages((prev) => {
        // استبدال tempMsg إذا كان هناك correlationId
        if (msg.correlationId) {
          const i = prev.findIndex((m) => m._id === msg.correlationId);
          if (i !== -1) {
            const updated = [...prev];
            updated[i] = { ...msg };
            return updated;
          }
        }
        // استبدال tempMsg المبني على التوقيت (temp-xxx)
        const tempIdx = prev.findIndex(
          (m) => m._id.startsWith("temp-") && m.sender === msg.sender && m.text === msg.text
        );
        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = { ...msg };
          return updated;
        }
        // تجنب التكرار
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const onTyping = (d: { userId: string; name: string }) => {
      if (d.userId === user?._id) return;
      setTypingUser(d.name);
      setTimeout(() => setTypingUser(null), 2500);
    };

    s.on("message:new", onMsg);
    s.on("user:typing", onTyping);
    return () => {
      s.off("message:new", onMsg);
      s.off("user:typing", onTyping);
    };
  }, [socketRef, user?._id]);

  // ─── إشارة الكتابة ────────────────────────────────────────────────────────
  const sendTyping = useCallback(() => {
    if (!convIdRef.current) return;
    socketRef.current?.emit("typing", { convId: convIdRef.current });
  }, [socketRef]);

  return {
    messages,
    convInfo,
    loading,
    sending,
    text,
    setText,
    typingUser,
    sendMessage,
    sendTyping,
  };
}