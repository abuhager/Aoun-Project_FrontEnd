import type { ChatMessage, ConversationListItem } from './chat.types';
import type { Notification } from './notification.types';
import type { PublicSettings } from './settings.types';
import { SOCKET_EVENTS } from '@/config/socket';

export interface SocketReadyPayload {
  recovered: boolean;
  serverTime: string;
  tokenExpiresAt: number;
}

export interface SocketAuthPayload {
  code: string;
  msg: string;
}

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
  [SOCKET_EVENTS.AUTH_FORCED_LOGOUT]: (data: SocketAuthPayload) => void;
  [SOCKET_EVENTS.AUTH_TOKEN_EXPIRING]: (data: { expiresAt: number }) => void;
  [SOCKET_EVENTS.AUTH_TOKEN_EXPIRED]: (data: SocketAuthPayload) => void;
  [SOCKET_EVENTS.SOCKET_READY]: (data: SocketReadyPayload) => void;
  [SOCKET_EVENTS.SETTINGS_UPDATED]: (data: PublicSettings) => void;

  [SOCKET_EVENTS.ITEM_RECIPIENT_CONFIRMED]: (data: { itemId: string; message: string; itemTitle?: string }) => void;
  [SOCKET_EVENTS.ITEM_DELIVERED]: (data: { itemId: string; message: string; itemTitle?: string }) => void;
  [SOCKET_EVENTS.ITEM_BOOKED]: (data: { itemId: string; bookedBy: string }) => void;
  [SOCKET_EVENTS.ITEM_BOOKING_CANCELLED]: (data: { itemId: string; status?: string }) => void;
  [SOCKET_EVENTS.ITEM_BOOKING_TRANSFERRED]: (data: { itemId: string; bookedBy: string }) => void;
  [SOCKET_EVENTS.ITEM_WAITLIST_PROMOTED]: (data: { itemId: string; status: string }) => void;
  [SOCKET_EVENTS.ITEM_DELETED]: (data: { itemId: string }) => void;
  [SOCKET_EVENTS.LEADERBOARD_UPDATE]: (data: { userId: string }) => void;

  [SOCKET_EVENTS.NEW_CONVERSATION]: (conversation: ConversationListItem) => void;
  [SOCKET_EVENTS.CONVERSATION_UPDATED]: (data?: { conversationId?: string }) => void;
  [SOCKET_EVENTS.RECEIVE_MESSAGE]: (data: { convId: string; message: ChatMessage }) => void;
  [SOCKET_EVENTS.TYPING_STATUS]: (data: { convId: string; userId: string; isTyping: boolean }) => void;
  [SOCKET_EVENTS.MESSAGES_READ]: (data: { conversationId: string; readBy: string }) => void;
  [SOCKET_EVENTS.CHAT_ERROR]: (data: { scope: string; code?: string; msg: string }) => void;
  [SOCKET_EVENTS.NOTIFICATION_NEW]: (notification: Notification) => void;
  [SOCKET_EVENTS.NOTIFICATION_REFRESH]: () => void;
}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.JOIN_ROOM]: (data: { convId: string }, ack: (response: JoinRoomAck) => void) => void;
  [SOCKET_EVENTS.LEAVE_ROOM]: (data: { convId: string }) => void;
  [SOCKET_EVENTS.SEND_MESSAGE]: (
    data: { convId: string; text: string; correlationId: string },
    ack: (response: SendMessageAck) => void
  ) => void;
  [SOCKET_EVENTS.MARK_READ]: (data: { convId: string }, ack?: (response: MarkReadAck) => void) => void;
  [SOCKET_EVENTS.TYPING_STATUS]: (data: { convId: string; isTyping: boolean }) => void;
}
