// src/config/routes.ts

export const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/add-item',
  '/admin',
  '/donate',
  '/my-items',
] as const;

export const AUTH_ONLY_PREFIXES = [
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
  '/reset-password',
] as const;

/**
 * يتحقق مما إذا كان المسار المعطى يقع ضمن المسارات المحمية
 */
export const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_PREFIXES.some(p => pathname.startsWith(p));

/**
 * يتحقق مما إذا كان المسار المعطى خاص بصفحات المصادقة فقط
 */
export const isAuthOnlyPath = (pathname: string): boolean =>
  AUTH_ONLY_PREFIXES.some(p => pathname.startsWith(p));