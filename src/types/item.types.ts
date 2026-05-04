// src/types/item.types.ts
// مطابق لـ Item.js Schema + itemDto.js transformations

import type {
  ItemStatus,
  ItemCategory,
  HandoverMode,
  PaginatedResponse,
} from './api.types';

import type {
  PublicUser,
  DonorUser,
  BookedByUser,
} from './user.types';

// ── re-export لسهولة الاستخدام ────────────────────────────────────
export type { ItemStatus, ItemCategory, HandoverMode };

// ── Waitlist Entry ────────────────────────────────────────────────
export interface WaitlistEntry {
  user: {
    _id: string;
    name?: string;
  };
  joinedAt?: string;
}

// ── الغرض العام — من toPublicItem() ─────────────────────────────
export interface Item {
  _id: string;
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  condition?: string;
  imageUrl: string;
  status: ItemStatus;           // ✅ الآن يشمل 'مخفي'
  reportCount: number;
  waitlistCount: number;        // ✅ عدد — مش array كاملة
  // ✅ حقول كانت مفقودة
  bookedAt?: string;
  isRated: boolean;
  handoverMode: HandoverMode;
  hubId?: string;
  createdAt: string;
  updatedAt?: string;
  donor: PublicUser | null;
  bookedBy?: {
    _id: string;
    name: string;
  } | null;
}

// ── الغرض للمتبرع — من toDonorItem() ────────────────────────────
export interface DonorItem extends Item {
  // ✅ لا يوجد otp — محذوف من الـ Backend
  bookedBy?: BookedByUser | null;  // يشمل phone + email
}

// ── الغرض للمستلم — من toReceiverItem() ─────────────────────────
export interface ReceiverItem extends Item {
  // ✅ لا يوجد otp — محذوف من الـ Backend
  donor: DonorUser | null;          // يشمل phone
}

// ── Responses من الـ API ──────────────────────────────────────────
export interface ItemsResponse extends PaginatedResponse<Item> {}

export interface MyItemsResponse {
  myDonations: DonorItem[];
  myRequests: ReceiverItem[];
  totalDonations: number;
  quota: number;
  trustScore: number;
}

// ── Create / Update Payloads ──────────────────────────────────────
export interface CreateItemPayload {
  title: string;
  category: ItemCategory;
  description?: string;
  location: string;
  condition?: string;
  // الصورة تُرسَل كـ FormData — مش هون
}

export interface UpdateItemPayload extends Partial<CreateItemPayload> {}

// ── Rating ────────────────────────────────────────────────────────
export interface RateItemPayload {
  rating: number; // 1-5 حالياً، سيصبح 1-10 في Phase 4
}

// ── Report ────────────────────────────────────────────────────────
export interface ReportUserPayload {
  reportedUserId: string;
  itemId: string;
}

// ── Pending Rating Response ───────────────────────────────────────
export interface PendingRatingItem {
  _id: string;
  title: string;
  imageUrl: string;
  bookedBy: {
    _id: string;
    name: string;
  };
}