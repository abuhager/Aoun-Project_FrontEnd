// src/middleware.ts — النسخة الآمنة
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED_PATHS = ['/dashboard', '/profile', '/donate', '/my-items'];
const AUTH_ONLY_PATHS = ['/login', '/register', '/verify-email'];
const ADMIN_PATHS     = ['/admin'];

// المفتاح يُقرأ من env — يُطابق JWT_SECRET في الباك إند
const getJwtSecret = () =>
  new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET ?? '');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PATHS.some(p => pathname.startsWith(p));
  const isAdmin     = ADMIN_PATHS.some(p => pathname.startsWith(p));

  // ✅ الحكم على الجلسة: وجود refreshToken httpOnly فقط
  const hasSession = !!request.cookies.get('refreshToken')?.value;

  if ((isProtected || isAdmin) && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ Admin: نتحقق من access token الحقيقي — لا من cookie قابلة للتزوير
  if (isAdmin && hasSession) {
    // Access Token يُمرَّر كـ header من الـ page request (SSR) أو يُقرأ من x-access-token
    // في Edge Runtime نستخدم jose لأن jsonwebtoken لا يعمل هنا
    try {
      const accessToken =
        request.headers.get('x-access-token') ??
        request.cookies.get('x-access-token')?.value ?? '';

      const { payload } = await jwtVerify(
        accessToken,
        getJwtSecret()
      );

      const role = (payload as { user?: { role?: string } }).user?.role;
      if (role !== 'admin' && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Token منتهي أو غائب → أعد للـ login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/profile/:path*', '/donate/:path*',
    '/my-items/:path*', '/admin/:path*',
    '/login', '/register', '/verify-email',
  ],
};