// src/types/hub.types.ts — يجب إنشاؤه
export interface SafeHub {
  _id:      string;
  name:     string;
  location: string;
  address:  string;
  isActive: boolean;
}

export interface HubDropOtpResponse {
  msg:        string;
  hubDropOtp: string; // يُعرض للمتبرع مرة واحدة فقط
}

export interface HubPickupOtpResponse {
  msg:           string;
  hubPickupOtp:  string; // يُعرض للمستلم مرة واحدة فقط
}

// src/types/notification.types.ts — يجب إنشاؤه
export type NotificationType =
  | 'booking'
  | 'waitlist_promoted'
  | 'rating_prompt'
  | 'report_update';

export interface Notification {
  _id:       string;
  type:      NotificationType;
  message:   string;
  isRead:    boolean;
  itemId?:   string;
  createdAt: string;
}

// src/types/api.types.ts — تأكد من وجوده
export interface PaginationQuery {
  page?:     number;
  limit?:    number;
  category?: string;
  location?: string;
  search?:   string;
}

export interface ApiError {
  msg:     string;
  field?:  string;
  errors?: Record<string, string>;
}