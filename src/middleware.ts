// src/middleware.ts — النسخة المُصلَحة
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard', '/profile', '/add-item',
  '/admin', '/donate', '/my-items',
];

const AUTH_ONLY_PREFIXES = [
  '/login', '/register', '/verify',
  '/forgot-password', '/reset-password',
];

// ✅ JWT structure validation — 3 parts مفصولة بنقاط، كل جزء Base64url
const isJwtShaped = (value: string): boolean => {
  if (!value || value.length < 20) return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  // كل جزء يجب أن يكون Base64url صالحاً وليس فارغاً
  return parts.every(p => p.length > 0 && /^[A-Za-z0-9\-_]+$/.test(p));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PREFIXES.some(p  => pathname.startsWith(p));

  const refreshCookie = request.cookies.get('refreshToken');
  // ✅ FIX: JWT structure validation بدل length check
  const hasValidSession = !!refreshCookie?.value && isJwtShaped(refreshCookie.value);

  if (isProtected && !hasValidSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    if (request.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(loginUrl);
    }
    return new NextResponse(
      JSON.stringify({ message: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  if (isAuthOnly && hasValidSession) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)'],
};