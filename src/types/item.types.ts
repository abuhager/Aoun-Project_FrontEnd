// src/types/item.types.ts

// ─── Status ─── (مركزي يُستخدم في كل المشروع)
export type ItemStatus = 'متاح' | 'محجوز' | 'تم التسليم';

// ─── User ───
export interface User {
  _id:               string;
  name:              string;
  email:             string;
  phone?:            string;
  avatar?:           string;
  trustScore:        number;
  quota:             number;
  isVerifiedStudent?: boolean;
}

// ─── Waitlist Entry ───
export interface WaitlistEntry {
  user: { _id: string; name?: string };
}

// ─── Item ───
export interface Item {
  _id:          string;
  title:        string;
  description:  string;
  category:     string;
  condition?:   string;
  status:       ItemStatus;       // ✅ بدل string مفتوح
  imageUrl:     string;
  location:     string;
  createdAt:    string;
  bookedAt?:    string;
  donor:        User;
  bookedBy?:    { _id: string; name: string };   // ✅ بعد الـ populate دايماً object
  waitlist:     WaitlistEntry[];
  deliveryOtp?: string;
  cancelledBy?: { _id: string }[];               // ✅ array من objects
  isRated?:     boolean;
}

// ─── API Responses ───
export interface ItemsResponse {
  items: Item[];
  pages: number;
  total: number;
}

export interface MyItemsResponse {
  myDonations: Item[];
  myRequests:  Item[];
}