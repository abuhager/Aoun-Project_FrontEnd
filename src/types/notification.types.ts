// src/types/notification.types.ts

// واجهة الإشعار الواحد (الموجودة لديك بالفعل)
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

// أضف هذه الواجهة الجديدة في الأسفل لتطابق الـ Object القادم من الـ API
export interface NotificationsResponse {
  notifications: Notification[]; // مصفوفة الإشعارات
  unreadCount: number;           // عدد الإشعارات غير المقروءة
}