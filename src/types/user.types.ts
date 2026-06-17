// src/types/user.types.ts — ✅ FULLY FIXED
import type { Item } from './item.types';

// ✅ إصلاح جذر المشكلة: نقوم ببناء وتصدير النوع الجديد باستخدام Item لتصفية أخطاء TypeScript و ESLint معاً
export type DashboardItem = Item & { reportId: string | null };

export type UserRole   = 'user' | 'admin' | 'super_admin';
export type TrustLevel = 1 | 2 | 3 | 4;

// FIXED [BUG-PROFILE-03]: يعكس ما يُرجعه buildGamificationProfile فقط
export interface Gamification {
  level:        number;
  title:        string;
  badge:        string;
  progress:     number;
  pointsToNext: number | null;
}

// ─── ما يُرجعه /api/auth/login و /api/auth/me ───────────────
export interface AuthUser {
  _id:               string;
  name:              string;
  email:             string;
  phone?:            string;
  avatar:            string;
  role:              UserRole;
  trustLevel:        TrustLevel;
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  createdAt:         string;
  gamification?: {
    trustScore:     number;
    totalDonations: number;
    level:          number;
    title:          string;
    badge:          string;
    progress:       number;
    pointsToNext:   number | null;
  };
}

// ─── ما يُرجعه /api/auth/profile كاملاً ──────────────────────
export interface ProfileUser {
  _id:               string;
  name:              string;
  email:             string;
  avatar:            string;
  role:              UserRole;
  trustScore:        number;
  trustLevel:        TrustLevel;
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  badges:            string[];
  createdAt:         string;
  gamification:      Gamification;
}

// ─── مستخدم عام ─────────────────────────────────────────────
export interface PublicUser {
  name:              string;
  avatar:            string;
  trustLevel:        1 | 2 | 3 | 4;
  isVerifiedStudent: boolean;
  createdAt:         string;
  gamification: {
    level:          number;
    title:          string;
    nextLevelAt:    number;
    progressPct:    number;
    totalDonations: number;
  };
}

export interface ProfileResponse {
  user:         ProfileUser;
  stats: {
    donationsCount:     number;
    completedDonations: number;
    receivedCount:      number;
    totalRatings:       number;
  };
  allDonations:      DashboardItem[]; // ✅ سيعمل الآن لأن DashboardItem معرّف في السطر 4
  completedRequests: DashboardItem[]; // ✅ سيعمل الآن لأن DashboardItem معرّف في السطر 4
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
  quota:        number;
  trustScore:   number;
  trustLevel:   TrustLevel;
  gamification: Gamification;
}