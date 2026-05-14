// src/types/item.types.ts ✅ ملف جديد — كان غائباً تماماً
import type { PublicUser, BookedByUser, AuthUser } from './user.types';
export type ItemStatus = 'متاح' | 'محجوز' | 'تم التسليم' | 'مخفي';
export type ItemCategory = 'كتب' | 'إلكترونيات' | 'أثاث' | 'أخرى' | 'ملابس';
export type HandoverMode = 'direct' | 'hub';

// ── الغرض الكامل (من GET /api/items/:id) ───────────────
export interface Item {
  _id: string;
  title: string;
  description: string;
  category: ItemCategory;
  imageUrl: string;
  cloudinaryId?: string;
  location: string;
  condition: string;
  status: ItemStatus;
  handoverMode: HandoverMode;
  hubId?: string | null;
  isRated: boolean;
  rating?: number | null;
  reportCount: number;
  bookedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  donor: PublicUser;
  bookedBy?: BookedByUser | null;
  waitlist?: WaitlistEntry[];
}

// ── عنصر في قائمة الانتظار ─────────────────────────────
export interface WaitlistEntry {
  user: string;
  joinedAt: string;
}

// ── الغرض في القوائم (بدون populate كامل) ──────────────
export interface ItemSummary {
  _id: string;
  title: string;
  imageUrl: string;
  status: ItemStatus;
  category: ItemCategory;
  location: string;
  createdAt: string;
  donor: Pick<PublicUser, '_id' | 'name' | 'avatar'>;
}

// ── إنشاء غرض جديد ─────────────────────────────────────
export interface CreateItemPayload {
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  condition?: string;
  handoverMode?: HandoverMode;
  hubId?: string;
  image: File;
}

// ── نتيجة جلب الأغراض مع Pagination ───────────────────
export interface GetItemsResponse {
  items: ItemSummary[];
  total: number;
  page: number;
  pages: number;
}

// ── نتيجة الحجز ────────────────────────────────────────
export interface BookItemResponse {
  status: 'booked' | 'waitlist';
  message: string;
  item?: Omit<Item, 'deliveryOtp'>;
}

// ── نتيجة التقييم ──────────────────────────────────────
export interface RateItemResponse {
  msg: string;
  trustScore: number;
}

// ── فلاتر البحث ────────────────────────────────────────
export interface ItemFilters {
  category?: ItemCategory;
  location?: string;
  page?: number;
  limit?: number;
}
// ── Dashboard Item (غرض المستخدم في لوحة التحكم) ──────────
export interface DashboardItem {
  _id: string;
  title: string;
  imageUrl: string;
  status: ItemStatus;
  category: ItemCategory;
  location: string;
  condition: string;
  isRated: boolean;
  rating?: number | null;
  reportCount: number;
  bookedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  donor: Pick<PublicUser, '_id' | 'name' | 'avatar'>;
  bookedBy?: BookedByUser | null;
  waitlist?: WaitlistEntry[];
  deliveryOtp?: string;
  hubDropOtp?: string;
  hubPickupOtp?: string;
}

// ── Response من GET /api/items/my-items ────────────────────
export interface MyItemsResponse {
    user:      AuthUser;
 myDonations: DashboardItem[];
 myRequests:  DashboardItem[];
}