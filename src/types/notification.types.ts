export type NotificationType =
  | "item_booked"
  | "booking_cancelled"
  | "booking_transferred"
  | "booking_expiry_reminder"
  | "waitlist_promoted"
  | "delivery_done"
  | "delivery_completed"
  | "recipient_confirmed"
  | "matching_item"
  | "item_deleted"
  | "item_deleted_by_admin"
  | "new_rating"
  | "report_resolved"
  | "admin_warning"
  | "admin_ban"
  | "account_suspended"
  | "new_message"
  | "request_new_offer"
  | "request_cancelled_by_requester"
  | "request_expired"
  | "offer_accepted"
  | "offer_rejected"
  | "offer_withdrawn";

export interface Notification {
  _id:             string;
  type:            NotificationType;
  title:           string;
  body:            string;
  actionUrl?:      string | null;
  itemId?:         string | null;
  conversationId?: string | null;
  metadata?:       Readonly<Record<string, unknown>> | null;
  isRead:          boolean;
  createdAt:       string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount:   number;
  totalCount:    number;
  hasMore:       boolean;
  limit:         number;
}
