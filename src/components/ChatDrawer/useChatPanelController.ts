"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChatRoom } from "@/hooks/useChatRoom";

export function useChatPanelController(conversationId: string) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const room = useChatRoom({ conversationId });

  const trimmedText = text.trim();
  const canSend = Boolean(trimmedText) && room.canSendMessages && !isSending;
  const lastMessageId = room.messages.at(-1)?._id;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [conversationId]);

  useEffect(() => {
    if (!lastMessageId) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [room.isTyping, lastMessageId]);

  const statusMessage = useMemo(() => {
    if (room.error) return room.error;
    if (room.loading) return "جاري تحميل الرسائل...";
    if (!room.isJoined) return "جاري الاتصال بالمحادثة...";
    return null;
  }, [room.error, room.isJoined, room.loading]);

  const handleSend = async () => {
    if (!canSend) return;
    const currentText = trimmedText;
    setText("");
    setIsSending(true);
    const sent = await room.sendMessage(currentText);
    if (!sent) setText(currentText);
    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleLoadOlder = async () => {
    const container = scrollRef.current;
    const previousHeight = container?.scrollHeight || 0;
    await room.loadOlder();
    window.requestAnimationFrame(() => {
      if (container) container.scrollTop += container.scrollHeight - previousHeight;
    });
  };

  const handleTextChange = (value: string) => {
    setText(value);
    room.emitTyping();
  };

  return {
    ...room,
    currentUserId: user?._id,
    text,
    isSending,
    canSend,
    statusMessage,
    bottomRef,
    scrollRef,
    inputRef,
    handleSend,
    handleLoadOlder,
    handleTextChange,
  };
}

export type ChatPanelController = ReturnType<typeof useChatPanelController>;
