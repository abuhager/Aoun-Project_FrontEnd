// src/types/user.types.ts
import type { Item } from './item.types';

export type DashboardItem = Item & { reportId: string | null };

export type UserRole = 'user' | 'admin' | 'super_admin';

// ✅ [FLOW2-FIX-06] TrustLevel يدعم 4 مستويات — متوافق مع 4-Level Verification System
// المشكلة القديمة: TrustLevel = 1 | 2 فقط → TypeScript errors صامتة عند مستوى 3 أو 4
// والأخطر: مقارنات trustLevel >= 3 في الـ UI كانت تُعامَل كـ never type
export type TrustLevel = 1 | 2 | 3 | 4;

// FIXED [BUG-PROFILE-03]
export interface Gamification {
  level:        number;
  title:        string;
  badge:        string;
  progress:     number;
  pointsToNext: number | null;
}

export interface AuthUser {
  _id:               string;
  name:              string;
  email:             string;
  phone?:            string;
  avatar:            string;
  role:              UserRole;
  trustLevel:        TrustLevel; // ← الآن 1|2|3|4 ✅
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  // ✅ [FLOW2-FIX-07] إضافة isFrozen — buildSafeUser في Backend يُرسله دائماً
  isFrozen?:         boolean;
  isBanned?:         boolean;
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

export interface ProfileUser {
  _id:               string;
  name:              string;
  email:             string;
  avatar:            string;
  role:              UserRole;
  trustScore:        number;
  trustLevel:        TrustLevel; // ← الآن 1|2|3|4 ✅
  quota:             number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  badges:            string[];
  createdAt:         string;
  gamification:      Gamification;
}

export interface PublicUser {
  name:              string;
  avatar:            string;
  trustLevel:        1 | 2 | 3 | 4; // ← لم يتغير، كان صحيحاً ✅
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
  trustScore:   number;
  trustLevel:   TrustLevel; // ← الآن 1|2|3|4 ✅
  gamification: Gamification;
}

// ✅ [FLOW2-FIX-04] نوع جديد لاستجابة getMeLogic مع pagination كامل
export interface GetMeResponse {
  user:               AuthUser;
  donations:          DashboardItem[];
  received:           DashboardItem[];
  page:               number;
  pageSize:           number;
  donationsTotal:     number;
  receivedTotal:      number;
  hasMoreDonations:   boolean;
  hasMoreReceived:    boolean;
  totalDonationPages: number;
  totalReceivedPages: number;
}