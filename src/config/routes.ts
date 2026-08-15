// src/config/routes.ts

export const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/add-item',
  '/admin',
  '/donate',
  '/my-items',
  '/booking',
  '/handover',
  '/conversations',
  '/notifications',
  '/leaderboard',
] as const;

export type ProtectedPrefix = typeof PROTECTED_PREFIXES[number];

export const AUTH_ONLY_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
] as const;

export type AuthOnlyPath = typeof AUTH_ONLY_PATHS[number];

export const AUTH_PUBLIC_PATHS = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/auth/forgot',
  '/auth/reset',
  '/auth/resend-otp',
] as const;

// ✅ استثناء مسار تفاصيل الغرض /items/:id ليتمكن الزائر من مشاهدته
export const isProtectedPath = (pathname: string): boolean => {
  if (pathname.startsWith('/items/')) {
    return false;
  }
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};

export const isAuthOnlyPath = (pathname: string): boolean =>
  AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path));

export const isAuthSafeUrl = (url: string): boolean =>
  AUTH_PUBLIC_PATHS.some((p) => url.includes(p));
