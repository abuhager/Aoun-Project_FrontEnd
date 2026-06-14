// src/config/routes.ts — ✅ ARCH-01: إضافة booking, handover, conversations
// هذا الملف يُستخدم في src/middleware.ts لحماية المسارات

// ── المسارات المحمية (تتطلب تسجيل دخول) ────────────────────
export const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/add-item',
  '/admin',
  '/donate',
  '/my-items',
  '/booking',        // ✅ ARCH-01: إضافة — صفحات الحجز
  '/handover',       // ✅ ARCH-01: إضافة — صفحات التسليم المباشر
  '/conversations',  // ✅ ARCH-01: إضافة — المحادثات
  '/notifications',  // ✅ إضافة استباقية — إشعارات تتطلب هوية المستخدم
] as const;

export type ProtectedPrefix = typeof PROTECTED_PREFIXES[number];

// ── المسارات الخاصة بالمصادقة فقط (لوحة/register/login) ────
// المستخدم المسجَّل يُعاد توجيهه عنها
export const AUTH_ONLY_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
] as const;

export type AuthOnlyPath = typeof AUTH_ONLY_PATHS[number];

// ── Helpers ──────────────────────────────────────────────────
export const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const isAuthOnlyPath = (pathname: string): boolean =>
  AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path));