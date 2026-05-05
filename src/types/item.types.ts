// src/types/item.types.ts
// ✅ PHASE 1 — محدّث: أضيف DashboardItem + DashboardData — Single Source of Truth
// حذف الـ interfaces المكرّرة في useDashboard.ts

import type { PublicUser, BookedByUser, DonorUser } from './user.types';

export type ItemStatus =
  | 'متاح'
  | 'محجوز'
  | 'مكتمل'
  | 'تم التسليم'
  | 'ملغي';

export type ItemCategory =
  | 'ملابس'
  | 'كتب'
  | 'أثاث'
  | 'إلكترونيات'
  | 'أدوات'
  | 'أخرى';

// ── الغرض الكامل — من GET /api/items و GET /api/items/:id ───────
export interface Item {
  _id:        string;
  title:      string;
  description: string;
  category:   ItemCategory;
  imageUrl:   string;
  status:     ItemStatus;
  isRated:    boolean;
  donor:      PublicUser;
  bookedBy?:  BookedByUser;
  waitlist:   string[];
  createdAt:  string;
  updatedAt:  string;
}

// ── الغرض كما يراه المستلم ──────────────────────────────
export interface ItemAsReceiver extends Item {
  donor: DonorUser;
}

// ── الغرض في Dashboard ──────────────────────────────────
export interface DashboardItem {
  _id:       string;
  title:     string;
  imageUrl:  string;
  status:    ItemStatus;
  isRated:   boolean;
  bookedBy?: BookedByUser;
}

// ── بيانات Dashboard كاملة ───────────────────────────────
export interface DashboardData {
  user:           import('./user.types').AuthUser;
  myDonations:    DashboardItem[];
  myRequests:     DashboardItem[];
  totalDonations: number;
  quota:          number;
  trustScore:     number;
}

// ── طلب إنشاء غرض ───────────────────────────────────────
export interface CreateItemRequest {
  title:       string;
  description: string;
  category:    ItemCategory;
}

export interface CreateItemResponse {
  success:  boolean;
  message?: string;
  item:     Item;
}

// ── Pagination ──────────────────────────────────────────────
export interface PaginatedItemsResponse {
  items:  Item[];
  total:  number;
  page:   number;
  pages:  number;
}
