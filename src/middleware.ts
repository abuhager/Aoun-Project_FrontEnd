// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/profile', '/donate', '/my-items', '/add-item', '/edit-item'];
const AUTH_ONLY_PATHS = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
const ADMIN_PATHS = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PATHS.some(p => pathname.startsWith(p));
  const isAdmin     = ADMIN_PATHS.some(p => pathname.startsWith(p));

  // ✅ قراءة httpOnly من headers الطلب — Edge Runtime يستطيع هذا
  // هذا server-side read وليس client-side JS read
  const hasSession = !!request.cookies.get('refreshToken')?.value;

  // ─── تبسيط: دمج isProtected و isAdmin في شرط واحد ─────────
  if ((isProtected || isAdmin) && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/profile/:path*', '/donate/:path*',
    '/my-items/:path*',  '/add-item/:path*', '/edit-item/:path*',
    '/admin/:path*',
    '/login', '/register', '/verify-email', '/forgot-password', '/reset-password',
  ],
};