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
  donor:                ItemDonor;
  safeHub:              SafeHub;
  bookedBy?:            { _id: string; name: string; avatar?: string } | null;
  bookedAt?:            string | null;
  recipientConfirmed:   boolean;
  donorConfirmed:       boolean;
  recipientConfirmedAt?:string | null;
  donorConfirmedAt?:    string | null;
  deliveredAt?:         string | null;
  reportCount?:         number;
  isRated?:             boolean;
  linkedRequestId?:     string | null;
  // فقط للمتبرع عند getItemById
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
  user:        { _id: string; name: string; email: string; trustScore: number; quota: number };
  myDonations: (Item & { reportId: string | null })[];
  myRequests:  (Item & { reportId: string | null })[];
}

export interface BookingResponse {
  success: boolean;
  msg:     string;
  itemId:  string;
  status:  ItemStatus;
}

export interface DeliveryResponse {
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
}

export interface CreateItemPayload {
  title:        string;
  description?: string;
  category:     string;
  location?:    string;
  condition:    ItemCondition;
  safeHub:      string;
  image:        File;
}

export interface UpdateItemPayload {
  title?:       string;
  description?: string;
  category?:    string;
  location?:    string;
  condition?:   ItemCondition;
  image?:       File;
}