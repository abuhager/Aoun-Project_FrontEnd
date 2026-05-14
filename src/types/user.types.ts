// src/types/user.types.ts
export type UserRole = 'user' | 'admin' | 'super_admin';

// ✅ جديد — مستويات الثقة للـ Phase 2
export type TrustLevel = 1 | 2;

export interface PublicUser {
  _id: string;
  name: string;
  avatar?: string;
  trustScore: number;
  isVerifiedStudent?: boolean;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  trustScore: number;       // 0–100
  trustLevel: TrustLevel;   // ✅ جديد — 1 أو 2
  quota: number;
  isVerified: boolean;
  isVerifiedStudent: boolean;
  isBanned: boolean;
  totalDonations: number;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BookedByUser {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface DonorUser extends PublicUser {
  phone?: string;
}

export interface DashboardStats {
  totalDonations: number;
  quota: number;
  trustScore: number;
  trustLevel: TrustLevel;   // ✅ جديد
}