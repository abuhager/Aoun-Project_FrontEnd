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
  _id:          string;
  title:        string;
  description:  string;
  category:     ItemCategory;
  imageUrl:     string;
  cloudinaryId?: string;
  location:     string;
  condition:    string;
  status:       ItemStatus;
  handoverMode: HandoverMode;
  hubId?:       string | null;
  isRated:      boolean;
  rating?:      number | null;
  reportCount:  number;
  bookedAt?:    string | null;
  cancelledBy?: string[];
  createdAt:    string;
  updatedAt:    string;
  donor:        PublicUser;
  bookedBy?:    BookedByUser | null;
  waitlist?:    WaitlistEntry[];
   safeHub?: SafeHub;
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
  bookedAt?:   string | null;
  createdAt:   string;
  updatedAt:   string;
  // ✅ بدل Pick<PublicUser,...> — نُعرّف الحقول مباشرة
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
  _id:               string;
  name:              string;
  email:             string;
  trustScore:        number;
  quota:             number;
  isVerifiedStudent: boolean;
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
  msg:        string;
  trustScore: number;
}

export interface ItemFilters {
  category?: ItemCategory;
  location?: string;
  page?:     number;
  limit?:    number;
}