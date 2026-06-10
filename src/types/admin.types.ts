// src/types/admin.types.ts
import type { TrustLevel } from './user.types';

export type AdminTab = 'users' | 'items' | 'reports' | 'audit';

export interface AdminUser {
  _id:               string;
  name:              string;
  email:             string;
  role:              'user' | 'admin';
  trustLevel:        TrustLevel;
  trustScore:        number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  isBanned:          boolean;   // ✅ موجود في page.tsx لكن ناقص من الـ interface
  avatar?:           string;    // ✅ إضافة avatar — مستخدم في page.tsx السطر 236
  totalDonations:    number;
  quota:             number;
  createdAt:         string;
}

export interface AuditLog {
  _id:         string;
  action:      string;
  adminId:     string;
  adminName:   string;
  targetId?:   string;
  targetType?: 'user' | 'item' | 'report';
  details?:    string;
  createdAt:   string;
}

export interface AdminStats {
  totalUsers:     number;
  totalItems:     number;
  totalDonations: number;
  pendingReports: number;
  activeHubs:     number;
}

export interface AdminReport {
  _id:       string;
  reporter:  { _id: string; name: string };
  reported:  { _id: string; name: string };
  item:      { _id: string; title: string };
  reason:    string;
  status:    'pending' | 'resolved' | 'dismissed';
  appeal?:   string;
  createdAt: string;
}
