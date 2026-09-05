export interface ChatParticipant {
  _id: string;
  name?: string;
  avatar?: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: string | ChatParticipant;
  text: string;
  createdAt: string;
  read: boolean;
  correlationId?: string;
}

interface ConversationItem {
  _id: string;
  title: string;
  imageUrl?: string;
  status?: string;
}

export interface ConversationListItem {
  _id: string;
  item: ConversationItem | null;
  owner: ChatParticipant | null;
  requester: ChatParticipant | null;
  participants: ChatParticipant[];
  lastMessage: string;
  lastMessageAt: string | null;
  updatedAt?: string;
  unreadCount: number;
}

export interface ConversationMessagesPage {
  conversation: ConversationListItem;
  messages: ChatMessage[];
  total: number;
  page: number;
  totalPages: number;
}
