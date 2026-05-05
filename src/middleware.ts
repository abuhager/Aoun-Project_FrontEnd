// src/middleware.ts
// ================================================================
// ✅ PHASE 1 — Edge-level route protection
// تعمل على Vercel Edge Runtime — لا يمكن تجاوزها من الـ Client
//
// BLAST RADIUS:
//   Direct:     جميع صفحات (protected) تحتاج token صالح
//   Cross-Repo: Backend يجب يرجع 401 للتوكن المنتهي
//   DB:         لا يوجد
// ================================================================
import { NextRequest, NextResponse } from 'next/server';

// المسارات المحمية — لا تسمح بدون token
const PROTECTED = [
  '/dashboard',
  '/donate',
  '/profile',
  '/settings',
  '/admin',
];

// مسارات auth — لو كان مسجّل نحوّله لـ dashboard
const AUTH_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // قراءة الـ token من Cookie (مخزّن من authController عبر httpOnly)
  const token = request.cookies.get('token')?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPath  = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // ── صفحة محمية ولا يوجد token → redirect للـ login
  if (isProtected && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── مسجّل ويحاول يفتح /login أو /register → نحوّله لـ dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // نطبّق middleware على كل المسارات وليس static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
