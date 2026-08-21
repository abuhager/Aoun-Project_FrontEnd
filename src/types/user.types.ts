// src/types/user.types.ts
import type { Item } from './item.types';

export type DashboardItem = Item & { reportId: string | null };

export type UserRole = 'user' | 'admin' | 'super_admin';

// trustLevel يعكس تحقق الهوية (1/2)، وهو منفصل عن gamification.level (1–5).
export type TrustLevel = 1 | 2;

// FIXED [BUG-PROFILE-03]
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
  phone?:            string | null;
  avatar:            string;
  role:              UserRole;
  trustScore:        number;
  trustLevel:        TrustLevel; // ← 1 | 2
  quota:             number;
  totalDonations:    number;
  badges:            string[];
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  phoneVerified:     boolean;
  // ✅ [FLOW2-FIX-07] إضافة isFrozen — buildSafeUser في Backend يُرسله دائماً
  isFrozen?:         boolean;
  isBanned?:         boolean;
  createdAt:         string;
  gamification?: Gamification;
}

export interface ProfileUser {
  _id:               string;
  name:              string;
  avatar:            string;
  role:              UserRole;
  trustScore:        number;
  trustLevel:        TrustLevel; // ← 1 | 2
  totalDonations:    number;
  isVerifiedStudent: boolean;
  badges:            string[];
  createdAt:         string;
  gamification:      Gamification;
}

export interface ProfileActivityItem {
  _id:       string;
  title:     string;
  category:  string;
  status:    string;
  imageUrl:  string;
  createdAt: string;
}

export interface PublicUser {
  name:              string;
  avatar:            string;
  trustLevel:        TrustLevel; // ← 1 | 2
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
  user: ProfileUser;
  stats: {
    donationsCount: number;
    receivedCount:  number;
    totalRatings:   number;
    averageRating:  number;
  };
  donations: ProfileActivityItem[];
  received:  ProfileActivityItem[];
  pagination: {
    page:               number;
    pageSize:           number;
    totalDonationPages: number;
    totalReceivedPages: number;
    hasMoreDonations:   boolean;
    hasMoreReceived:    boolean;
  };
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
  trustLevel:   TrustLevel; // ← 1 | 2
  gamification: Gamification;
}

// ✅ [FLOW2-FIX-04] نوع جديد لاستجابة getMeLogic مع pagination كامل
export interface GetMeResponse {
  user:               AuthUser;
  donations:          ProfileActivityItem[];
  received:           ProfileActivityItem[];
  page:               number;
  pageSize:           number;
  donationsTotal:     number;
  receivedTotal:      number;
  hasMoreDonations:   boolean;
  hasMoreReceived:    boolean;
  totalDonationPages: number;
  totalReceivedPages: number;
}
