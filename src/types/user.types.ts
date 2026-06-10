// src/types/user.types.ts
import type { DashboardItem } from './item.types';
export type UserRole   = 'user' | 'admin' | 'super_admin';

// ✅ إصلاح: يعكس الـ Backend بالضبط → User.js: { min: 1, max: 4 }
export type TrustLevel = 1 | 2 | 3 | 4;

// ─── ما يُرجعه /api/auth/login و /api/auth/me ───────────────
export interface Gamification {
  trustScore:     number;
  totalDonations: number;
  level:          number;
  title:          string;
  badge:          string;
  progress:       number;
  pointsToNext:   number | null;
}

export interface AuthUser {
  _id:               string;
  name:              string;
  email:             string;
  avatar:            string;
  role:              UserRole;
  trustLevel:        TrustLevel; // ✅ بدل 1 | 2
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  createdAt:         string;
  gamification:      Gamification;
}

// ─── ما يُرجعه /api/auth/me كاملاً (Dashboard/Profile) ──────
export interface ProfileUser {
  _id:               string;
  name:              string;
  email:             string;
  avatar:            string;
  role:              UserRole;
  trustLevel:        TrustLevel; // ✅ بدل 1 | 2
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  badges:            string[];
  createdAt:         string;
  gamification:      Gamification;
}

// ─── مستخدم عام (يُعرض في صفحة item بجانب اسم المتبرع) ─────
export interface PublicUser {
  _id:               string;
  name:              string;
  avatar:            string;
  trustLevel:        TrustLevel; // ✅ بدل 1 | 2
  isVerifiedStudent: boolean;
  createdAt:         string;
  whatsapp:          string | null;
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
  trustLevel:   TrustLevel; // ✅ بدل TrustLevel المحصور بـ 1|2
  gamification: Gamification;
}