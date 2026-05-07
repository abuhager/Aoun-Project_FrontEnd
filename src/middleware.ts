// src/middleware.ts — Next.js Edge Middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS    = ['/', '/login', '/register', '/browse', '/forgot-password'];
const PUBLIC_PREFIXES = ['/verify', '/items/', '/reset-password', '/_next', '/api'];
const PROTECTED       = ['/dashboard', '/add-item', '/edit-item', '/profile'];
const ADMIN           = ['/admin'];

function isPublic(p: string) {
  return PUBLIC_PATHS.includes(p) || PUBLIC_PREFIXES.some(x => p.startsWith(x));
}
function isProtected(p: string) {
  return PROTECTED.some(x => p.startsWith(x));
}
function isAdmin(p: string) {
  return ADMIN.some(x => p.startsWith(x));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── مسارات عامة ─────────────────────────────────────────────
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // ── تحقق من الجلسة ──────────────────────────────────────────
  // refreshToken هو httpOnly cookie يُزرع من الباك عند login
  // Next.js middleware يقدر يقرأه حتى لو httpOnly
  const hasSession =
    request.cookies.has('refreshToken') ||
    request.cookies.has('token'); // ← fallback للكوكيز القديمة

  // ── مسارات محمية ────────────────────────────────────────────
  if (isProtected(pathname) || isAdmin(pathname)) {
    if (!hasSession) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // ── Admin — الحماية الكاملة في الـ page.tsx نفسها ──────────
    // الـ middleware فقط يمنع غير المسجلين
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};