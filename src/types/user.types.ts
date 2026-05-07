// src/types/user.types.ts
// ✅ متزامن 100% مع User.js Schema في الـ Backend

export type UserRole = 'user' | 'admin' | 'super_admin';

// ── المستخدم في الـ responses العامة ──────────────────────
export interface PublicUser {
  _id:               string;
  name:              string;
  avatar?:           string;
  trustScore:        number;
  isVerifiedStudent?: boolean;
}

// ── المستخدم الكامل — من GET /api/auth/me ──────────────
export interface AuthUser {
  _id:               string;
  name:              string;
  email:             string;
  phone?:            string;
  avatar?:           string;
  role:              UserRole;
  trustScore:        number;    // 0–100
  quota:             number;    // عدد الحجوزات المتبقية لهذا الشهر
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  isBanned:          boolean;
  totalDonations:    number;    // عدد التبرعات المكتملة
  badges:            string[];  // ['first_donation', 'top_donor', ...]
  createdAt:         string;
  updatedAt:         string;
}

// ── بيانات الحاجز — تظهر للمتبرع فقط ──────────────────
export interface BookedByUser {
  _id:    string;
  name:   string;
  phone?: string;
  email?: string;
}

// ── بيانات المتبرع — تظهر للمستلم فقط ─────────────────
export interface DonorUser extends PublicUser {
  phone?: string;
}

// ── إحصائيات الـ Dashboard ───────────────────────────────
export interface DashboardStats {
  totalDonations: number;
  quota:          number;
  trustScore:     number;
}
