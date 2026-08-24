export const SOCKET_EVENTS = {
  AUTH_FORCED_LOGOUT: "auth:forced_logout",
  AUTH_TOKEN_EXPIRING: "auth:token_expiring",
  AUTH_TOKEN_EXPIRED: "auth:token_expired",
  SOCKET_READY: "socket:ready",
  SETTINGS_UPDATED: "settings:updated",

  ITEM_BOOKED: "item:booked",
  ITEM_BOOKING_CANCELLED: "item:booking_cancelled",
  ITEM_BOOKING_TRANSFERRED: "item:booking_transferred",
  ITEM_WAITLIST_PROMOTED: "item:waitlist_promoted",
  ITEM_RECIPIENT_CONFIRMED: "item:recipient_confirmed",
  ITEM_DELIVERED: "item:delivered",
  ITEM_DELETED: "item:deleted",
  LEADERBOARD_UPDATE: "leaderboard:update",

  NEW_CONVERSATION: "new_conversation",
  CONVERSATION_UPDATED: "conversation_updated",
  RECEIVE_MESSAGE: "receive_message",
  TYPING_STATUS: "typing_status",
  MESSAGES_READ: "messages_read",
  CHAT_ERROR: "chat_error",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  SEND_MESSAGE: "send_message",
  MARK_READ: "mark_read",

  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_REFRESH: "notification:refresh",
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
