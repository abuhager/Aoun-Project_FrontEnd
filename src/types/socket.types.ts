import type { ChatMessage, ConversationListItem } from './chat.types';
import type { Notification } from './notification.types';

export interface JoinRoomAck {
  ok: boolean;
  success: boolean;
  conversationId?: string;
  messages?: ChatMessage[];
  page?: number;
  totalPages?: number;
  canSend?: boolean;
  code?: string;
  error?: string;
}

export interface SendMessageAck {
  ok: boolean;
  success: boolean;
  message?: ChatMessage;
  correlationId?: string | null;
  code?: string;
  error?: string;
}

export interface MarkReadAck {
  ok: boolean;
  success: boolean;
  markedCount?: number;
  code?: string;
  error?: string;
}

export interface ServerToClientEvents {
  'booking:waitlist': (data: { itemId: string; position: number }) => void;
  'booking:available': (data: { itemId: string; itemTitle: string }) => void;
  'booking:confirmed': (data: { itemId: string }) => void;
  'item:recipient_confirmed': (data: { itemId: string; message: string; itemTitle?: string }) => void;
  'item:delivered': (data: { itemId: string; message: string; itemTitle?: string }) => void;
  'item:booked': (data: { itemId: string; bookedBy: string }) => void;
  'item:booking_cancelled': (data: { itemId: string; status?: string }) => void;
  'item:booking_transferred': (data: { itemId: string; bookedBy: string }) => void;
  'item:waitlist_promoted': (data: { itemId: string; status: string }) => void;
  'item:deleted': (data: { itemId: string }) => void;
  'leaderboard:update': () => void;

  'new_conversation': (conversation: ConversationListItem) => void;
  'conversation_updated': (data?: { conversationId?: string }) => void;
  'receive_message': (data: { convId: string; message: ChatMessage }) => void;
  'typing_status': (data: { convId: string; userId: string; isTyping: boolean }) => void;
  'messages_read': (data: { conversationId: string; readBy: string }) => void;
  'chat_error': (data: { scope: string; code?: string; msg: string }) => void;
  'notification:new': (notification: Notification) => void;
  'notification:refresh': () => void;
}

export interface ClientToServerEvents {
  'join_room': (data: { convId: string }, ack: (response: JoinRoomAck) => void) => void;
  'leave_room': (data: { convId: string }) => void;
  'send_message': (
    data: { convId: string; text: string; correlationId: string },
    ack: (response: SendMessageAck) => void
  ) => void;
  'mark_read': (data: { convId: string }, ack?: (response: MarkReadAck) => void) => void;
  'typing_status': (data: { convId: string; isTyping: boolean }) => void;
}
