// src/types/socket.types.ts
// ✅ FL13-05 FIX: توحيد delivery events — Backend يُرسل "message" وليس "itemTitle" فقط

export interface ServerToClientEvents {
  'booking:waitlist'  : (data: { itemId: string; position: number })      => void;
  'booking:available' : (data: { itemId: string; itemTitle: string })      => void;
  'booking:confirmed' : (data: { itemId: string })                         => void;

  'delivery:recipient_confirmed': (data: {
    itemId:    string;
    message:   string;   // ← الحقل الفعلي من Backend
    itemTitle?: string;
  }) => void;
  'delivery:completed': (data: {
    itemId:    string;
    message:   string;
    itemTitle?: string;
  }) => void;

  'notification:new': (data: import('./notification.types').Notification) => void;
}

export interface ClientToServerEvents {
  'join:user'        : (userId: string) => void;
  'leave:user'       : (userId: string) => void;
  'join_room' : (data: { itemId: string; convId: string }) => void;
  'typing'           : (data: { convId: string }) => void;
}