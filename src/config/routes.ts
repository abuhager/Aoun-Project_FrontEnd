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
  '/verify',
] as const;

export type AuthOnlyPath = typeof AUTH_ONLY_PATHS[number];

export const AUTH_PUBLIC_PATHS = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/resend-otp',
] as const;

export const matchesRoutePrefix = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

// ✅ استثناء مسار تفاصيل الغرض /items/:id ليتمكن الزائر من مشاهدته
export const isProtectedPath = (pathname: string): boolean => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'items') {
    return segments.length > 2;
  }
  return PROTECTED_PREFIXES.some((prefix) => matchesRoutePrefix(pathname, prefix));
};

export const isAuthOnlyPath = (pathname: string): boolean =>
  AUTH_ONLY_PATHS.some((path) => matchesRoutePrefix(pathname, path));

export const getSafeRedirectPath = (
  candidate: string | null | undefined,
  fallback = '/browse'
): string => {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback;
  }

  try {
    const base = new URL('https://aoun.local');
    const target = new URL(candidate, base);
    if (target.origin !== base.origin || target.pathname === '/login') return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
};

export const isAuthSafeUrl = (url: string): boolean => {
  let pathname: string;
  try {
    pathname = new URL(url, 'http://aoun.local').pathname;
  } catch {
    pathname = url.split('?')[0];
  }
  const normalizedPath = pathname.replace(/^\/api(?=\/)/, '');
  return AUTH_PUBLIC_PATHS.some((path) =>
    path === '/auth/reset-password'
      ? matchesRoutePrefix(normalizedPath, path)
      : normalizedPath === path
  );
};
