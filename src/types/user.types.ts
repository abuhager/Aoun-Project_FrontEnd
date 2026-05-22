// src/types/user.types.ts
import type { DashboardItem } from './item.types';
export type UserRole   = 'user' | 'admin' | 'super_admin';
export type TrustLevel = 1 | 2;

// ─── ما يُرجعه /api/auth/login و /api/auth/me ───────────────
// ✅ متوافق مع authService.js بعد الإصلاح 2 و3
// ❌ لا phone, لا isBanned, لا totalDonations, لا badges, لا updatedAt
export interface AuthUser {
  _id:               string;
  name:              string;
  email:             string;
  avatar?:           string;
  role:              UserRole;
  trustScore:        number;
  trustLevel:        TrustLevel;
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  createdAt:         string;
}

// ─── ما يُرجعه /api/auth/me كاملاً (Dashboard/Profile) ──────
// يحتوي على حقول إضافية للعرض في صفحة الملف الشخصي
export interface ProfileUser {
  _id:               string;
  name:              string;
  email:             string;
  avatar:            string;
  role:              'user' | 'admin' | 'super_admin';
  trustScore:        number;
  trustLevel:        1 | 2;
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  totalDonations:    number;
  badges:            string[];
  createdAt:         string;
}
// ─── مستخدم عام (يُعرض في صفحة item بجانب اسم المتبرع) ─────
export interface PublicUser {
  name:              string;
  avatar:            string;
   _id:               string;
  trustScore:        number;
  trustLevel:        1 | 2;
  totalDonations:    number;
  isVerifiedStudent: boolean;
  createdAt:         string;
  whatsapp:          string | null;
}
export interface ProfileResponse {
  user:             ProfileUser;
  stats: {
    donationsCount:     number;
    completedDonations: number;
    receivedCount:      number;
    totalRatings:       number;
  };
  allDonations:      DashboardItem[];
  completedRequests: DashboardItem[];
}
export interface BookedByUser {
  _id:    string;
  name:   string;
  phone?: string;
  email?: string;
}

export interface DonorUser extends PublicUser {
  phone?: string;
}

export interface DashboardStats {
  totalDonations: number;
  quota:          number;
  trustScore:     number;
  trustLevel:     TrustLevel;
}
