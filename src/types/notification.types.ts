// src/types/notification.types.ts
export interface Notification {
  _id:             string;
  type:            string;
  title:           string;
  body:            string;
  itemId?:         string | null;
  conversationId?: string | null;
  isRead:          boolean;
  createdAt:       string;
}
