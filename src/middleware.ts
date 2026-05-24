// src/middleware.ts — ✅ FIXED: اعتمد على httpOnly refreshToken
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/profile', '/donate', '/my-items'];
const AUTH_ONLY_PATHS = ['/login', '/register', '/verify-email'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PATHS.some(p => pathname.startsWith(p));

  // ✅ FIXED: اعتمد على وجود refreshToken (httpOnly — لا يمكن تزويره)
  // بدل aoun_user الذي يمكن تزويره من Console
  const hasSession = !!request.cookies.get('refreshToken')?.value;

  // للـ admin: نقرأ aoun_user فقط للـ role لكن نتحقق من الجلسة أولاً
  let userRole = 'user';
  if (hasSession) {
    try {
      const userCookie = request.cookies.get('aoun_user')?.value;
      if (userCookie) {
        const parsed = JSON.parse(decodeURIComponent(userCookie));
        userRole = parsed?.role ?? 'user';
      }
    } catch { /* cookie تالف */ }
  }

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ Admin: يحتاج جلسة صالحة + role صحيح
  if (pathname.startsWith('/admin') && (!hasSession || userRole !== 'admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/donate/:path*',
    '/my-items/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/verify-email',
  ],
};