// src/types/user.types.ts
// ✅ PHASE 1 — محدّث: أضيف trustLevel + phoneVerified مطابقين لـ User.js Schema

export type UserRole = 'user' | 'admin' | 'super_admin';

// ── المستخدم في الـ responses العامة (toPublicItem) ───────────────
export interface PublicUser {
  _id: string;
  name: string;
  avatar?: string;
  trustScore: number;
  isVerifiedStudent?: boolean;
}

// ── المستخدم الكامل — من GET /api/auth/me ─────────────────
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  trustScore: number;
  quota: number;
  isVerified: boolean;
  isVerifiedStudent: boolean;
  isBanned: boolean;
  totalDonations: number;
  badges: string[];
  createdAt: string;
  updatedAt: string;

  // ✅ Phase 1 — Trust System fields (مطابقة لـ User.js Schema)
  trustLevel:    1 | 2;
  phoneVerified: boolean;
  monthlyDonations?: number;
}

// ── بيانات الحاجز — تظهر للمتبرع فقط (toDonorItem) ─────────
export interface BookedByUser {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

// ── بيانات المتبرع — تظهر للمستلم فقط (toReceiverItem) ────────
export interface DonorUser extends PublicUser {
  phone?: string;
}

// ── بيانات الـ Dashboard ───────────────────────────────────
export interface DashboardStats {
  totalDonations: number;
  quota: number;
  trustScore: number;
  trustLevel: 1 | 2;
}
