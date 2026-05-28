// src/types/user.types.ts
import type { DashboardItem } from './item.types';
export type UserRole   = 'user' | 'admin' | 'super_admin';
export type TrustLevel = 1 | 2;

// ─── ما يُرجعه /api/auth/login و /api/auth/me ───────────────
// ✅ متوافق مع authService.js بعد الإصلاح 2 و3
// ❌ لا phone, لا isBanned, لا totalDonations, لا badges, لا updatedAt
export interface Gamification {
  trustScore:    number;
  totalDonations: number;
  level:         number;
  title:         string;
  badge:         string;
  progress:      number;
  pointsToNext:  number | null;
}
export interface AuthUser {
  _id:               string;
  name:              string;
  email:             string;
  avatar:            string;
  role:              UserRole;
  trustLevel:        1 | 2;
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  createdAt:         string;
  gamification:      Gamification; // ✅ أضف
}

// ─── ما يُرجعه /api/auth/me كاملاً (Dashboard/Profile) ──────
// يحتوي على حقول إضافية للعرض في صفحة الملف الشخصي
export interface ProfileUser {
  _id:               string;
  name:              string;
  email:             string;
  avatar:            string;
  role:              UserRole;
  trustLevel:        1 | 2;
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  badges:            string[];
  createdAt:         string;
  gamification:      Gamification;   // ✅ أضف
}
// ─── مستخدم عام (يُعرض في صفحة item بجانب اسم المتبرع) ─────
export interface PublicUser {
  _id:               string;
  name:              string;
  avatar:            string;
  trustLevel:        1 | 2;
  isVerifiedStudent: boolean;
  createdAt:         string;
  whatsapp:          string | null;
  gamification:      Gamification;   // ✅ أضف
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
  quota:      number;
  trustLevel: TrustLevel;
  gamification: Gamification; // ✅ أضف
}
