// src/types/socket.types.ts
// Phase 3 — Socket.io event types (server → client)

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'waitlist_promoted'
  | 'delivery_completed'
  | 'rating_prompt'
  | 'hub_drop_otp'
  | 'hub_pickup_otp'
  | 'report_resolved'
  | 'badge_earned';

export interface SocketNotification {
  _id:       string;
  type:      NotificationType;
  message:   string;
  itemId?:   string;
  itemTitle?: string;
  read:      boolean;
  createdAt: string;
}

export interface ServerToClientEvents {
  notification:       (data: SocketNotification) => void;
  waitlist_promoted:  (data: { itemId: string; itemTitle: string }) => void;
  booking_update:     (data: { itemId: string; status: string }) => void;
  rating_prompt:      (data: { itemId: string; donorName: string }) => void;
  badge_earned:       (data: { badge: BadgeType; message: string }) => void;
}

export interface ClientToServerEvents {
  join_room:  (userId: string) => void;
  leave_room: (userId: string) => void;
}

export type BadgeType =
  | 'first_donation'
  | 'eco_hero'
  | 'trusted_donor'
  | 'generous_5'
  | 'generous_10'
  | 'top_donor';