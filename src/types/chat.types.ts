// src/types/chat.types.ts
export interface ChatMessage {
  _id:            string;
  sender:         string | { _id: string; name: string };
  text:           string;
  createdAt:      string;
  read:           boolean;
  correlationId?: string;
}
export interface ConversationInfo { _id: string; item: string; }
export interface ConversationListItem {
  _id:          string;
  item:         { _id: string; title: string; imageUrl?: string; status?: string } | null;
  participants: { _id: string; name: string; avatar?: string }[];
  lastActivity: string;
  unreadCount:  number;
}
