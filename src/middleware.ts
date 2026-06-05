// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/add-item',
  '/admin',
  '/donate',
  '/my-items',
];

const AUTH_ONLY_PREFIXES = [
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
  '/reset-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PREFIXES.some(p => pathname.startsWith(p));

  // ✅ يعمل صح الآن بعد إصلاح path:'/' في REFRESH_COOKIE_OPTIONS
  // Edge Runtime يقرأ الـ cookie في كل المسارات
  const hasSession = !!request.cookies.get('refreshToken')?.value;

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ المستخدم المسجل لا يذهب لصفحات المصادقة
  if (isAuthOnly && hasSession) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/add-item/:path*',
    '/admin/:path*',
    '/donate/:path*',
    '/my-items/:path*',
    '/login',
    '/register',
    '/verify',
    '/forgot-password',
    '/reset-password/:path*',
  ],
};