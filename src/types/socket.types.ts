// src/types/socket.types.ts
// أحداث دورة الغرض كما يرسلها Backend في itemService.

export interface ServerToClientEvents {
  'booking:waitlist'  : (data: { itemId: string; position: number })      => void;
  'booking:available' : (data: { itemId: string; itemTitle: string })      => void;
  'booking:confirmed' : (data: { itemId: string })                         => void;

  'item:recipient_confirmed': (data: {
    itemId:    string;
    message:   string;   // ← الحقل الفعلي من Backend
    itemTitle?: string;
  }) => void;
  'item:delivered': (data: {
    itemId:    string;
    message:   string;
    itemTitle?: string;
  }) => void;
  'item:booked': (data: { itemId: string; bookedBy: string }) => void;
  'item:booking_cancelled': (data: { itemId: string; status?: string }) => void;
  'item:booking_transferred': (data: { itemId: string; bookedBy: string }) => void;
  'item:waitlist_promoted': (data: { itemId: string; status: string }) => void;
  'item:deleted': (data: { itemId: string }) => void;

  'notification:new': (data: import('./notification.types').Notification) => void;
}

export interface ClientToServerEvents {
  'join:user'        : (userId: string) => void;
  'leave:user'       : (userId: string) => void;
  'join_room' : (data: { itemId: string; convId: string }) => void;
  'typing'           : (data: { convId: string }) => void;
}
