// src/types/item.types.ts
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

export type ItemCondition =
  | 'جديد'
  | 'جيد جداً'
  | 'جيد'
  | 'مقبول'
  | 'يحتاج إصلاح';

export interface WaitlistEntry {
  user:     string;
  joinedAt: string;
}

export interface Item {
  _id:         string;
  title:       string;
  description: string;
  category:    ItemCategory;
  condition?:  ItemCondition | string;
  location?:   string;
  imageUrl:    string;
  status:      ItemStatus;
  isRated:     boolean;
  donor:       PublicUser;
  bookedBy?:   BookedByUser;
  bookedAt?:   string;          // تاريخ الحجز — ISO date
  waitlist:    WaitlistEntry[];
  cancelledBy: string[];
  createdAt:   string;
  updatedAt:   string;
}

export interface ItemAsReceiver extends Item {
  donor: DonorUser;
}

export interface DashboardItem {
  _id:         string;
  title:       string;
  imageUrl:    string;
  status:      ItemStatus;
  isRated:     boolean;
  bookedBy?:   BookedByUser;
  bookedAt?:   string;
  donor?:      PublicUser;
  waitlist:    WaitlistEntry[];
  cancelledBy: string[];
}

export interface DashboardData {
  user:           import('./user.types').AuthUser;
  myDonations:    DashboardItem[];
  myRequests:     DashboardItem[];
  totalDonations: number;
  quota:          number;
  trustScore:     number;
}

export interface CreateItemRequest {
  title:       string;
  description: string;
  category:    ItemCategory;
  condition?:  string;
  location?:   string;
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

export type ItemsResponse   = PaginatedItemsResponse;
export type MyItemsResponse = {
  user:        import('./user.types').AuthUser;
  myDonations: DashboardItem[];
  myRequests:  DashboardItem[];
};
