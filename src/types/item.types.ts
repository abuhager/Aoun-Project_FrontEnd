// src/types/item.types.ts

// ✅ حذف AuthUser من الـ import — لم يعد مستخدماً
import type { PublicUser, BookedByUser } from './user.types';
import { SafeHub } from "./hub.types"; // ✅ استيراد النوع

export type ItemStatus   = 'متاح' | 'محجوز' | 'تم التسليم' | 'مخفي';
export type ItemCategory = 'كتب' | 'إلكترونيات' | 'أثاث' | 'أخرى' | 'ملابس';
export type HandoverMode = 'direct' | 'hub';

export interface WaitlistEntry {
  user:     string;
  joinedAt: string;
}

export interface Item {
  _id:                  string;
  title:                string;
  description:          string;
  category:             ItemCategory;
  imageUrl:             string;
  cloudinaryId?:        string;
  location:             string;
  condition:            string;
  status:               ItemStatus;
  handoverMode:         HandoverMode;
  hubId?:               string | null;
  isRated:              boolean;
  rating?:              number | null;
  reportCount:          number;
  bookedAt?:            string | null;
  cancelledBy?:         string[];
  createdAt:            string;
  updatedAt:            string;
  donor:                PublicUser;
  bookedBy?:            BookedByUser | null;
  waitlist?:            WaitlistEntry[];
  safeHub?:             SafeHub;
  donorConfirmed?:      boolean;
  recipientConfirmed?:  boolean; // ✅ تأكيد الاستلام من المستلم
}

export interface ItemSummary {
  _id:       string;
  title:     string;
  imageUrl:  string;
  status:    ItemStatus;
  category:  ItemCategory;
  location:  string;
  createdAt: string;
  // ✅ بدل Pick<PublicUser,...> — نُعرّف الحقول مباشرة لتجنب خطأ الـ keyof
  donor: {
    _id:    string;
    name:   string;
    avatar?: string;
  };
}

export interface DashboardItem {
  _id:         string;
  title:       string;
  imageUrl:    string;
  status:      ItemStatus;
  category:    ItemCategory;
  location:    string;
  condition:   string;
  isRated:     boolean;
  rating?:     number | null;
  reportCount: number;
  reportId?:   string;          // ✅ إضافة — لزر الاعتراض
  bookedAt?:   string | null;
  createdAt:   string;
  updatedAt:   string;
  donorConfirmed?:      boolean;
  recipientConfirmed?: boolean;

  donor: {
    _id:    string;
    name:   string;
    avatar?: string;
  };
  bookedBy?:  BookedByUser | null;
  waitlist?:  WaitlistEntry[];
}
// ✅ نوع خاص بـ user object في /api/items/me
export interface MyItemsUser {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  trustScore?: number;
  trustLevel?: number;
  quota?: number;
  isVerified?: boolean;
  isVerifiedStudent?: boolean;
  gamification?: {
    level: number;
    xp: number;
    badges: string[];
    trustScore: number;
  };
}

export interface MyItemsResponse {
  user:        MyItemsUser;
  myDonations: DashboardItem[];
  myRequests:  DashboardItem[];
}

export interface CreateItemPayload {
  title:         string;
  description:   string;
  category:      ItemCategory;
  location:      string;
  condition?:    string;
  handoverMode?: HandoverMode;
  hubId?:        string;
  image:         File;
}

export interface GetItemsResponse {
  items: ItemSummary[];
  total: number;
  page:  number;
  pages: number;
}

export interface BookItemResponse {
  status:  'booked' | 'waitlist';
  message: string;
  item?:   Item;
}

export interface RateItemResponse {
  msg:          string;
  gamification: {        // ← كان trustScore: number
    trustScore:     number;
    totalDonations: number;
    level:          number;
    title:          string;
    badge:          string;
    progress:       number;
    pointsToNext:   number | null;
  };
}
export interface ItemFilters {
  category?: ItemCategory;
  location?: string;
  page?:     number;
  limit?:    number;
}

export type ConfirmationType = 'recipient_confirm' | 'donor_confirm';
