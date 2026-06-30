"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import axiosInstance from "@/lib/api/axiosInstance";

export type ChatUser = {
  _id: string;
  name: string;
  avatar?: string;
};

export type ChatMessage = {
  _id: string;
  conversation: string;
  sender: string | ChatUser;
  text: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type ChatConversation = {
  _id: string;
  item: {
    _id: string;
    title: string;
    images?: string[];
  } | null;
  owner: ChatUser | null;
  requester: ChatUser | null;
  participants: string[];
  unreadCount?: number;
  lastMessage?: string;
  lastMessageAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type GetMessagesResponse = {
  status: string;
  results: number;
  page: number;
  totalPages: number;
  data: ChatMessage[];
};

type GetConversationsResponse = {
  status: string;
  results: number;
  data: ChatConversation[];
};

type InitConversationResponse = {
  status: string;
  data: ChatConversation;
};

export default function useChat(itemId?: string) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const initRequestedRef = useRef(false);

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const { data } = await axiosInstance.get<GetConversationsResponse>("/api/conversations");
      setConversations(data.data ?? []);
      return data.data ?? [];
    } catch (error) {
      console.error("[useChat] fetch conversations error:", error);
      setConversations([]);
      return [];
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string, page = 1) => {
    try {
      setLoadingMessages(true);
      const { data } = await axiosInstance.get<GetMessagesResponse>(
        `/api/conversations/${conversationId}/messages?page=${page}`
      );
      setMessages(data.data ?? []);
      return data.data ?? [];
    } catch (error) {
      console.error("[useChat] fetch messages error:", error);
      setMessages([]);
      return [];
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const initConversation = useCallback(async () => {
    if (!itemId || initRequestedRef.current) return null;

    try {
      initRequestedRef.current = true;
      const { data } = await axiosInstance.post<InitConversationResponse>("/api/conversations", {
        itemId,
      });
      setActiveConversation(data.data);
      return data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const list = await fetchConversations();
        const existing = list.find((c) => c.item?._id === itemId) ?? null;
        if (existing) {
          setActiveConversation(existing);
          return existing;
        }
      }
      console.error("[useChat] initConversation error:", error);
      return null;
    }
  }, [itemId, fetchConversations]);

  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    if (!text.trim()) return null;

    try {
      setSending(true);
      const { data } = await axiosInstance.post<{ status: string; data: ChatMessage }>(
        `/api/conversations/${conversationId}/messages`,
        { text: text.trim() }
      );

      setMessages((prev) => [...prev, data.data]);
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: data.data.text,
                lastMessageAt: data.data.createdAt,
              }
            : c
        )
      );

      return data.data;
    } catch (error) {
      console.error("[useChat] sendMessage error:", error);
      return null;
    } finally {
      setSending(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sending,
    fetchConversations,
    fetchMessages,
    initConversation,
    sendMessage,
  };
}