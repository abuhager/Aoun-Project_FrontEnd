// src/types/item.types.ts — ✅ PATCHED [FRONT-01]: أنواع كاملة لكل API response
import type { SafeHub } from "@/types/hub.types";

export type ItemStatus = "متاح" | "محجوز" | "تم التسليم" | "مخفي";
export type ItemCondition = "جديد" | "مستعمل ممتاز" | "مستعمل جيد";

export interface ItemDonor {
  _id:                string;
  name:               string;
  avatar?:            string;
  trustScore?:        number;
  trustLevel?:        number;
  isVerifiedStudent?: boolean;
  phone?:             string;
}

export interface WaitlistEntry {
  user:     { _id: string; name: string; avatar?: string; trustLevel?: number };
  joinedAt: string;
}

export interface Item {
  _id:                  string;
  title:                string;
  description?:         string;
  category:             string;
  location?:            string;
  imageUrl?:            string;
  condition:            ItemCondition;
  status:               ItemStatus;
  donor:                ItemDonor | null;
  safeHub:              SafeHub | null;
  bookedBy?:            {
    _id: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
  } | null;
  bookedAt?:            string | null;
  recipientConfirmed:   boolean;
  donorConfirmed:       boolean;
  recipientConfirmedAt?:string | null;
  donorConfirmedAt?:    string | null;
  deliveredAt?:         string | null;
  reportCount?:         number;
  isRated?:             boolean;
  linkedRequestId?:     string | null;
  isInWaitlist:                boolean;
  bookingPreviouslyCancelled:  boolean;
  waitlist?:            WaitlistEntry[];
  waitlistCount:        number;
  // من الـ settings
  expiryHours?:         number;
  createdAt:            string;
  updatedAt:            string;
}

// ── Response Types ────────────────────────────────────────────────────────────

export interface ItemsListResponse {
  items: Item[];
  total: number;
  page:  number;
  pages: number;
}

export interface MyItemsResponse {
  user: {
    _id:               string;
    name:              string;
    email:             string;
    avatar:            string;
    trustScore:        number;
    trustLevel:        number;
    quota:             number;
    totalDonations:    number;
    isVerifiedStudent: boolean;
    badges:            string[];
    gamification: {
      trustScore:     number;
      totalDonations: number;
      level:          number;
      title:          string;
      badge:          string;
      progress:       number;
      pointsToNext:   number | null;
    };
  };
  myDonations: (Item & { reportId: string | null })[];
  myRequests:  (Item & { reportId: string | null })[];
}

export interface BookingResponse {
  success:    boolean;
  msg:        string;
  itemId:     string;
  status?:    ItemStatus;
  waitlisted: boolean;   // ✅ جديد
  position?:  number;    // ✅ جديد
}

export interface DeliveryResponse {
  success?: boolean;
  status:  "pending_donor" | "delivered";
  msg:     string;
  itemId:  string;
}

// ── Payload Types ─────────────────────────────────────────────────────────────

export interface ItemFilters {
  page?:     number;
  limit?:    number;
  search?:   string;
  category?: string;
  location?: string;
  availableOnly?: boolean;
}

export interface CancelBookingResponse {
  msg:        string;
  itemId:     string;
  status:     ItemStatus;
  promoted:   boolean;
  bookedBy:   Item["bookedBy"];
}

export interface LeaveWaitlistResponse {
  msg:           string;
  itemId:        string;
  waitlisted:    false;
  waitlistCount: number;
}

export interface CreateItemPayload {
  title:        string;
  description?: string;
  category:     string;
  location?:    string;
  condition:    ItemCondition;
  safeHub?:     string;
  image:        File;
}

export interface UpdateItemPayload {
  title?:       string;
  description?: string;
  category?:    string;
  location?:    string;
  condition?:   ItemCondition;
  safeHub?:      string;
  image?:       File;
}
