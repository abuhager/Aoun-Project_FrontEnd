import axiosInstance from '@/lib/api/axiosInstance';
import type {
  ConversationListItem,
  ConversationMessagesPage,
} from '@/types/chat.types';

interface ApiEnvelope<T> {
  status: string;
  data: T;
}

interface OpenConversationData {
  conversation: ConversationListItem;
  isNew: boolean;
}

interface MessagesEnvelope extends ConversationMessagesPage {
  status: string;
}

export async function listConversations(signal?: AbortSignal) {
  const response = await axiosInstance.get<ApiEnvelope<ConversationListItem[]>>(
    '/api/conversations',
    { signal }
  );
  return response.data.data;
}

export async function openConversation(itemId: string) {
  const response = await axiosInstance.post<ApiEnvelope<OpenConversationData>>(
    '/api/conversations',
    { itemId }
  );
  return response.data.data;
}

export async function getConversationMessages(
  conversationId: string,
  page: number,
  signal?: AbortSignal
) {
  const response = await axiosInstance.get<MessagesEnvelope>(
    `/api/conversations/${conversationId}/messages`,
    { params: { page }, signal }
  );
  return response.data;
}

export async function markConversationRead(conversationId: string) {
  await axiosInstance.put(`/api/conversations/${conversationId}/read`);
}
