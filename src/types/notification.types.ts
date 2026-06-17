// src/types/notification.types.ts
// ✅ DC-16 FIX (Cascading من NJ-05): إضافة actionUrl للـ Notification interface
//    notifyUser.js (Backend) يرسل actionUrl في metadata لكن الـ Frontend لا يعرّفه

export interface Notification {
  _id:             string;
  type:            string;
  title:           string;
  body:            string;
  // ✅ DC-16: حقول مضافة لتطابق notifyUser.js في Backend
  actionUrl?:      string | null;   // ← deep-link مثل /items/:id
  itemId?:         string | null;
  conversationId?: string | null;
  isRead:          boolean;
  createdAt:       string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount:   number;
}