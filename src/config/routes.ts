// src/config/routes.ts
// ✅ ARCH-01: إضافة booking, handover, conversations
// ✅ DUP-01: مركزة مسارات الـ API الآمنة (isAuthSafeUrl) هنا بدلاً من axiosInstance

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

// ── مسارات الـ API الآمنة (لا تتطلب توكن للوصول) ───────────────
// تُستخدم في axiosInstance.ts لمنع الـ Interceptors من التدخل
export const AUTH_PUBLIC_PATHS = [
  '/auth/refresh', 
  '/auth/login', 
  '/auth/register',
  '/auth/verify',
  '/auth/forgot', 
  '/auth/reset',
  '/auth/resend-otp' // ✅ أضفت resend-otp لتكتمل القائمة
] as const;


// ── Helpers ──────────────────────────────────────────────────

export const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const isAuthOnlyPath = (pathname: string): boolean =>
  AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path));

// ✅ DUP-01: تم نقل هذه الدالة هنا ليتم استيرادها في axiosInstance
export const isAuthSafeUrl = (url: string): boolean =>
  AUTH_PUBLIC_PATHS.some((p) => url.includes(p));