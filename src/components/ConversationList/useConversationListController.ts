"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { SOCKET_EVENTS } from "@/config/socket";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { listConversations, markConversationRead } from "@/lib/api/conversationApi";
import type { ConversationListItem } from "@/types/chat.types";
import { getOtherParticipant } from "./conversationListUtils";

type ControllerOptions = {
  isOpen: boolean;
  initialConversationId: string | null;
  onUnreadCountChange?: (count: number) => void;
};

export function useConversationListController({
  isOpen,
  initialConversationId,
  onUnreadCountChange,
}: ControllerOptions) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId);
  const [search, setSearch] = useState("");

  const {
    data: conversations = [],
    error: conversationsError,
    isLoading,
    mutate,
  } = useSWR<ConversationListItem[]>(
    isOpen ? "/api/conversations" : null,
    () => listConversations(),
    { revalidateOnFocus: true }
  );

  const selected = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedId) || null,
    [conversations, selectedId]
  );

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0),
    [conversations]
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const other = getOtherParticipant(conversation, user?._id);
      return [conversation.item?.title, other?.name, conversation.lastMessage]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase("ar").includes(query));
    });
  }, [conversations, search, user?._id]);

  useEffect(() => {
    onUnreadCountChange?.(unreadTotal);
  }, [onUnreadCountChange, unreadTotal]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => void mutate();
    const resyncAfterReconnect = () => {
      if (!socket.recovered) refresh();
    };

    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, refresh);
    socket.on(SOCKET_EVENTS.NEW_CONVERSATION, refresh);
    socket.on(SOCKET_EVENTS.MESSAGES_READ, refresh);
    socket.on("connect", resyncAfterReconnect);

    return () => {
      socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED, refresh);
      socket.off(SOCKET_EVENTS.NEW_CONVERSATION, refresh);
      socket.off(SOCKET_EVENTS.MESSAGES_READ, refresh);
      socket.off("connect", resyncAfterReconnect);
    };
  }, [mutate, socket]);

  const openConversation = useCallback(
    async (conversation: ConversationListItem) => {
      const secureId = conversation._id;
      if (!secureId) return;
      setSelectedId(secureId);

      if ((conversation.unreadCount || 0) === 0) return;
      const snapshot = conversations;
      await mutate(
        (current) =>
          current?.map((item) =>
            item._id === secureId ? { ...item, unreadCount: 0 } : item
          ),
        { revalidate: false }
      );

      try {
        await markConversationRead(secureId);
      } catch {
        await mutate(snapshot, { revalidate: true });
      }
    },
    [conversations, mutate]
  );

  const returnToInbox = useCallback(() => {
    setSelectedId(null);
    void mutate();
  }, [mutate]);

  return {
    userId: user?._id,
    conversations,
    filteredConversations,
    conversationsError,
    isLoading,
    selected,
    selectedId,
    selectedParticipant: selected ? getOtherParticipant(selected, user?._id) : null,
    unreadTotal,
    search,
    setSearch,
    missingRequestedConversation: Boolean(
      !isLoading && selectedId && !selected && !conversationsError
    ),
    openConversation,
    returnToInbox,
    retry: () => void mutate(),
  };
}

export type ConversationListController = ReturnType<
  typeof useConversationListController
>;
