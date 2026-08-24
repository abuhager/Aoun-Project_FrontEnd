"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { getConversationMessages } from "@/lib/api/conversationApi";
import type { ChatMessage } from "@/types/chat.types";
import type { JoinRoomAck, SendMessageAck } from "@/types/socket.types";

const JOIN_TIMEOUT_MS = 8_000;
const SEND_TIMEOUT_MS = 8_000;
const MAX_MESSAGE_LENGTH = 2_000;

type RoomStatus = "idle" | "joining" | "ready" | "error";

interface RoomState {
  conversationId: string | null;
  messages: ChatMessage[];
  page: number;
  totalPages: number;
  canSend: boolean;
  status: RoomStatus;
  error: string | null;
}

interface PendingMessage {
  timeout: ReturnType<typeof setTimeout>;
  resolve: (sent: boolean) => void;
}

interface UseChatRoomOptions {
  conversationId: string | null;
}

const senderId = (message: ChatMessage) => (
  typeof message.sender === "string" ? message.sender : message.sender._id
);

const mergeMessages = (first: ChatMessage[], second: ChatMessage[]) => {
  const byId = new Map<string, ChatMessage>();
  [...first, ...second].forEach((message) => byId.set(message._id, message));
  return [...byId.values()].sort((left, right) => {
    const dateOrder = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    return dateOrder || left._id.localeCompare(right._id);
  });
};

const createCorrelationId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

export function useChatRoom({ conversationId }: UseChatRoomOptions) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomState>({
    conversationId: null,
    messages: [],
    page: 1,
    totalPages: 1,
    canSend: false,
    status: "idle",
    error: null,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const pendingRef = useRef(new Map<string, PendingMessage>());
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const olderRequestRef = useRef<AbortController | null>(null);
  const joinedConversationRef = useRef<string | null>(null);
  const earlyMessagesRef = useRef<ChatMessage[]>([]);

  const isCurrentRoom = room.conversationId === conversationId;
  const messages = isCurrentRoom ? room.messages : [];
  const loading = Boolean(conversationId) && (!isCurrentRoom || room.status === "joining");
  const isJoined = Boolean(
    socket?.connected
    && conversationId
    && isCurrentRoom
    && room.status === "ready"
  );
  const canSendMessages = isJoined && room.canSend;
  const error = isCurrentRoom ? room.error : null;
  const hasOlder = isCurrentRoom && room.page < room.totalPages;

  const settlePending = useCallback((correlationId: string, sent: boolean) => {
    const pending = pendingRef.current.get(correlationId);
    if (!pending) return;
    clearTimeout(pending.timeout);
    pendingRef.current.delete(correlationId);
    pending.resolve(sent);
  }, []);

  const replaceOptimistic = useCallback((message: ChatMessage, fallbackId?: string | null) => {
    const correlationId = message.correlationId || fallbackId || undefined;
    setRoom((current) => {
      if (current.conversationId !== message.conversationId) return current;
      const withoutOptimistic = correlationId
        ? current.messages.filter((item) => item.correlationId !== correlationId)
        : current.messages;
      return {
        ...current,
        messages: mergeMessages(withoutOptimistic, [message]),
        error: null,
      };
    });
    if (correlationId) settlePending(correlationId, true);
  }, [settlePending]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    let cancelled = false;
    const pendingMessages = pendingRef.current;

    joinedConversationRef.current = null;
    earlyMessagesRef.current = [];

    const clearJoinTimer = () => {
      if (!joinTimerRef.current) return;
      clearTimeout(joinTimerRef.current);
      joinTimerRef.current = null;
    };

    const joinRoom = () => {
      if (cancelled) return;
      clearJoinTimer();
      joinedConversationRef.current = null;
      setIsTyping(false);
      setLoadingOlder(false);
      setRoom((current) => (
        current.conversationId === conversationId
          ? { ...current, status: "joining", error: null }
          : {
              conversationId,
              messages: [],
              page: 1,
              totalPages: 1,
              canSend: false,
              status: "joining",
              error: null,
            }
      ));

      socket.emit("join_room", { convId: conversationId }, (response: JoinRoomAck) => {
        if (cancelled) return;
        clearJoinTimer();

        if (!response.ok || response.conversationId !== conversationId) {
          setRoom((current) => ({
            ...current,
            conversationId,
            status: "error",
            error: response.error || "تعذر فتح المحادثة",
          }));
          return;
        }

        joinedConversationRef.current = conversationId;
        const history = response.messages || [];
        const buffered = earlyMessagesRef.current;
        earlyMessagesRef.current = [];
        setRoom((current) => ({
          conversationId,
          messages: mergeMessages(
            current.conversationId === conversationId ? current.messages : [],
            mergeMessages(history, buffered)
          ),
          page: response.page || 1,
          totalPages: response.totalPages || 1,
          canSend: response.canSend !== false,
          status: "ready",
          error: null,
        }));
      });

      joinTimerRef.current = setTimeout(() => {
        if (cancelled || joinedConversationRef.current === conversationId) return;
        setRoom((current) => ({
          ...current,
          conversationId,
          status: "error",
          error: "انتهت مهلة الاتصال بالمحادثة؛ حاول مجدداً",
        }));
      }, JOIN_TIMEOUT_MS);
    };

    const onReceiveMessage = ({
      convId,
      message,
    }: {
      convId: string;
      message: ChatMessage;
    }) => {
      if (convId !== conversationId) return;

      if (joinedConversationRef.current !== conversationId) {
        earlyMessagesRef.current = mergeMessages(earlyMessagesRef.current, [message]);
      } else {
        replaceOptimistic(message, message.correlationId);
      }

      if (senderId(message) !== user?._id) {
        socket.emit("mark_read", { convId: conversationId });
      }
    };

    const onTypingStatus = ({
      convId,
      userId,
      isTyping: typing,
    }: {
      convId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (convId !== conversationId || userId === user?._id) return;
      setIsTyping(typing);
    };

    const onMessagesRead = ({
      conversationId: readConversationId,
      readBy,
    }: {
      conversationId: string;
      readBy: string;
    }) => {
      if (readConversationId !== conversationId) return;
      setRoom((current) => {
        if (current.conversationId !== conversationId) return current;
        return {
          ...current,
          messages: current.messages.map((message) => (
            senderId(message) === readBy ? message : { ...message, read: true }
          )),
        };
      });
    };

    const onDisconnect = () => {
      joinedConversationRef.current = null;
      setIsTyping(false);
      setRoom((current) => (
        current.conversationId === conversationId
          ? { ...current, status: "joining", error: null }
          : current
      ));
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("typing_status", onTypingStatus);
    socket.on("messages_read", onMessagesRead);
    socket.on("connect", joinRoom);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) joinRoom();

    return () => {
      cancelled = true;
      clearJoinTimer();
      socket.off("receive_message", onReceiveMessage);
      socket.off("typing_status", onTypingStatus);
      socket.off("messages_read", onMessagesRead);
      socket.off("connect", joinRoom);
      socket.off("disconnect", onDisconnect);

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
        if (socket.connected) {
          socket.emit("typing_status", { convId: conversationId, isTyping: false });
        }
      }
      if (socket.connected) socket.emit("leave_room", { convId: conversationId });

      olderRequestRef.current?.abort();
      pendingMessages.forEach((pending) => {
        clearTimeout(pending.timeout);
        pending.resolve(false);
      });
      pendingMessages.clear();
    };
  }, [conversationId, replaceOptimistic, socket, user?._id]);

  const sendMessage = useCallback((rawText: string): Promise<boolean> => {
    const text = rawText.trim();
    if (!socket || !conversationId || !canSendMessages || !text || text.length > MAX_MESSAGE_LENGTH) {
      return Promise.resolve(false);
    }

    const correlationId = createCorrelationId();
    const optimisticMessage: ChatMessage = {
      _id: `temp-${correlationId}`,
      conversationId,
      sender: user?._id || "me",
      text,
      read: false,
      createdAt: new Date().toISOString(),
      correlationId,
    };

    setRoom((current) => (
      current.conversationId === conversationId
        ? { ...current, messages: [...current.messages, optimisticMessage], error: null }
        : current
    ));

    return new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        pendingRef.current.delete(correlationId);
        setRoom((current) => (
          current.conversationId === conversationId
            ? {
                ...current,
                messages: current.messages.filter(
                  (message) => message.correlationId !== correlationId
                ),
                error: "لم يؤكد الخادم حفظ الرسالة؛ حاول مجدداً",
              }
            : current
        ));
        resolve(false);
      }, SEND_TIMEOUT_MS);
      pendingRef.current.set(correlationId, { timeout, resolve });

      socket.emit(
        "send_message",
        { convId: conversationId, text, correlationId },
        (response: SendMessageAck) => {
          if (!response.ok || !response.message) {
            setRoom((current) => (
              current.conversationId === conversationId
                ? {
                    ...current,
                    messages: current.messages.filter(
                      (message) => message.correlationId !== correlationId
                    ),
                    error: response.error || "تعذر إرسال الرسالة",
                  }
                : current
            ));
            settlePending(correlationId, false);
            return;
          }

          replaceOptimistic(
            { ...response.message, correlationId },
            response.correlationId || correlationId
          );
        }
      );
    });
  }, [canSendMessages, conversationId, replaceOptimistic, settlePending, socket, user?._id]);

  const emitTyping = useCallback(() => {
    if (!socket || !conversationId || !canSendMessages) return;
    socket.emit("typing_status", { convId: conversationId, isTyping: true });

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing_status", { convId: conversationId, isTyping: false });
      typingTimerRef.current = null;
    }, 1_500);
  }, [canSendMessages, conversationId, socket]);

  const loadOlder = useCallback(async () => {
    if (!conversationId || !hasOlder || loadingOlder) return;
    const nextPage = room.page + 1;
    olderRequestRef.current?.abort();
    const controller = new AbortController();
    olderRequestRef.current = controller;
    setLoadingOlder(true);

    try {
      const response = await getConversationMessages(conversationId, nextPage, controller.signal);
      setRoom((current) => (
        current.conversationId === conversationId
          ? {
              ...current,
              messages: mergeMessages(response.messages, current.messages),
              page: response.page,
              totalPages: response.totalPages,
              error: null,
            }
          : current
      ));
    } catch (requestError) {
      if (!controller.signal.aborted) {
        console.error("[useChatRoom] load older messages failed", requestError);
        setRoom((current) => (
          current.conversationId === conversationId
            ? { ...current, error: "تعذر تحميل الرسائل الأقدم" }
            : current
        ));
      }
    } finally {
      if (!controller.signal.aborted) setLoadingOlder(false);
    }
  }, [conversationId, hasOlder, loadingOlder, room.page]);

  return {
    messages,
    isJoined,
    canSendMessages,
    isTyping,
    loading,
    error,
    hasOlder,
    loadingOlder,
    sendMessage,
    emitTyping,
    loadOlder,
  };
}

export type { ChatMessage } from "@/types/chat.types";
