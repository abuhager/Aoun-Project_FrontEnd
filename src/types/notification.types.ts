// src/types/notification.types.ts
export type NotificationType =
  | 'item_booked'
  | 'booking_cancelled'
  | 'waitlist_promoted'
  | 'delivery_done'
  | 'new_rating'
  | 'report_resolved';

export interface Notification {
  _id:       string;
  type:      NotificationType;
  title:     string;
  body:      string;
  itemId:    string | null;
  isRead:    boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount:   number;
}