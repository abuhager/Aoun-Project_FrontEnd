// src/types/socket.types.ts
// ✅ Patched: أضف أحداث Double Confirmation

export interface ServerToClientEvents {
  'booking:waitlist'         : (data: { itemId: string; position: number })                          => void;
  'booking:available'        : (data: { itemId: string; itemTitle: string })                         => void;
  'booking:confirmed'        : (data: { itemId: string })                                            => void;
  // ✅ Double Confirmation events
  'delivery:recipient_confirmed': (data: { itemId: string; itemTitle: string })                      => void;
  'delivery:completed'          : (data: { itemId: string; itemTitle: string })                      => void;
}

export interface ClientToServerEvents {
  'join:user' : (userId: string) => void;
  'leave:user': (userId: string) => void;
}
