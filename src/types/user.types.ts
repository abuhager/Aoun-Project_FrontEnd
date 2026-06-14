// src/types/user.types.ts — النسخة الكاملة المُصلَحة
import type { DashboardItem } from './item.types';

export type UserRole   = 'user' | 'admin' | 'super_admin';
export type TrustLevel = 1 | 2 | 3 | 4;

// ✅ FIXED [BUG-PROFILE-03]: يعكس ما يُرجعه buildGamificationProfile فقط
export interface Gamification {
  level:        number;
  title:        string;
  badge:        string;
  progress:     number;
  pointsToNext: number | null;
}

// ─── ما يُرجعه /api/auth/login و /api/auth/me ───────────────
// ✅ FIXED [BUG-PROFILE-02]: أضيف badges
// ✅ FIXED [BUG-PROFILE-03]: trustScore و totalDonations على مستوى الجذر
export interface AuthUser {
  _id:               string;
  name:              string;
  email:             string;
  avatar:            string;
  role:              UserRole;
  trustScore:        number;      // ← على مستوى الجذر من buildSafeUser
  trustLevel:        TrustLevel;
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  badges:            string[];    // ✅ أضيف
  createdAt:         string;
  gamification:      Gamification;
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
// ✅ FIXED [BUG-PROFILE-01]: حُذف whatsapp — غير موجود في Backend
export interface PublicUser {
  _id:               string;
  name:              string;
  avatar:            string;
  trustLevel:        TrustLevel;
  isVerifiedStudent: boolean;
  createdAt:         string;
  gamification:      Gamification;
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
  quota:        number;
  trustScore:   number;   // ✅ أضيف — موجود في buildSafeUser
  trustLevel:   TrustLevel;
  gamification: Gamification;
}