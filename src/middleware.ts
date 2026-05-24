// middleware.ts (في جذر مجلد src/ أو الجذر مباشرة)
// ✅ Phase 1: Edge-level route protection لـ Next.js
// يعمل على Vercel Edge Runtime — لا DB queries هنا إطلاقاً

import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify }                      from 'jose';

// المسارات المحمية
const PROTECTED_PATHS = ['/dashboard', '/profile', '/donate', '/my-items'];

// المسارات العامة للمصادقة (إذا كان مسجّل دخول — أعِدْ توجيهه)
const AUTH_ONLY_PATHS = ['/login', '/register', '/verify-email'];

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PATHS.some(p => pathname.startsWith(p));

  // ── جلب الـ access token ────────────────────────────────────
  // في Phase 1: نقرأ من Authorization header (in-memory token)
  // أو من cookie كـ fallback (بعد refresh)
  const authHeader  = request.headers.get('authorization') ?? '';
  const cookieToken = request.cookies.get('accessToken')?.value;
  const token       = authHeader.replace('Bearer ', '') || cookieToken;

  let isValidToken  = false;
  let userRole      = 'user';

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      isValidToken = true;
      userRole     = (payload as { user?: { role?: string } }).user?.role ?? 'user';
    } catch {
      isValidToken = false;
    }
  }

  // ── منطق التوجيه ────────────────────────────────────────────
  if (isProtected && !isValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // حماية مسارات Admin
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // تطبيق الـ middleware على هذه المسارات فقط
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