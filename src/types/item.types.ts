// src/types/item.types.ts
// ✅ مزامنة 100% مع Item.js في الـ Backend — لا تعديل جزئي بعد الآن

import type { PublicUser, BookedByUser, DonorUser } from './user.types';

// ── Enums ─────────────────────────────────────────────
export type ItemStatus =
  | 'متاح'
  | 'محجوز'
  | 'تم التسليم'
  | 'مخفي';

export type ItemCategory =
  | 'كتب'
  | 'إلكترونيات'
  | 'أثاث'
  | 'أخرى'
  | 'ملابس';

export type HandoverMode = 'direct' | 'hub';

// ── Sub-types ─────────────────────────────────────────
export interface WaitlistEntry {
  user:     string;
  joinedAt: string;
}

// ── Item الكامل — مطابق حقل بحقل مع Item.js ───────────
export interface Item {
  _id:          string;
  title:        string;
  description:  string;
  category:     ItemCategory;
  imageUrl:     string;
  cloudinaryId?: string;
  location:     string;
  condition?:   string;           // default: 'مستعمل ممتاز'
  status:       ItemStatus;
  isRated:      boolean;
  bookedAt?:    string | null;    // ISO date
  reportCount?: number;
  rating?:      number | null;    // 1-5
  handoverMode: HandoverMode;     // 'direct' | 'hub'
  hubId?:       string | null;    // ref: SafeHub

  // الحقول ذات الـ select:false — تصل فقط في ردود مخصصة
  deliveryOtp?: string;
  hubDropOtp?:  string;
  hubPickupOtp?: string;

  donor:       PublicUser;
  bookedBy?:   BookedByUser | null;
  waitlist:    WaitlistEntry[];
  cancelledBy: string[];

  createdAt:   string;
  updatedAt:   string;
}

// ── الغرض كما يراه المستلم ───────────────────────────
export interface ItemAsReceiver extends Item {
  donor: DonorUser;
}

// ── الغرض في Dashboard ─────────────────────────────────
export interface DashboardItem {
  _id:          string;
  title:        string;
  imageUrl:     string;
  status:       ItemStatus;
  isRated:      boolean;
  bookedAt?:    string | null;
  bookedBy?:    BookedByUser | null;
  donor?:       PublicUser;
  waitlist:     WaitlistEntry[];
  cancelledBy:  string[];
  handoverMode?: HandoverMode;
  rating?:      number | null;
}

// ── بيانات Dashboard ──────────────────────────────────
export interface DashboardData {
  user:           import('./user.types').AuthUser;
  myDonations:    DashboardItem[];
  myRequests:     DashboardItem[];
  totalDonations: number;
  quota:          number;
  trustScore:     number;
}

// ── طلبات الـ API ───────────────────────────────────────
export interface CreateItemRequest {
  title:        string;
  description:  string;
  category:     ItemCategory;
  location:     string;
  condition?:   string;
  handoverMode?: HandoverMode;
  hubId?:       string;
}

export interface CreateItemResponse {
  success:  boolean;
  message?: string;
  item:     Item;
}

export interface PaginatedItemsResponse {
  items:  Item[];
  total:  number;
  page:   number;
  pages:  number;
}

// ── Aliases ──────────────────────────────────────────────
export type ItemsResponse   = PaginatedItemsResponse;
export type MyItemsResponse = {
  user:        import('./user.types').AuthUser;
  myDonations: DashboardItem[];
  myRequests:  DashboardItem[];
};
