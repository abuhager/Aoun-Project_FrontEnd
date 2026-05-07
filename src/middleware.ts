// src/middleware.ts — Next.js Edge Middleware
// ✅ لا يحتاج JWT_SECRET — فقط يتحقق من وجود token وصلاحيته الزمنية
// التحقق الحقيقي (signature) يتم في الـ Backend عند كل طلب API
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

interface JwtPayload {
  user?: { id?: string; role?: string };
  exp?:  number;
  iat?:  number;
}

// ── Decode بدون verify — آمن للـ Edge لأن التحقق الحقيقي في الـ Backend ────────
function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    ) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

function isTokenAlive(payload: JwtPayload): boolean {
  if (!payload.exp) return true; // لا ينتهي — مقبول
  return payload.exp * 1000 > Date.now();
}

function hasUserId(payload: JwtPayload): boolean {
  return !!(payload.user?.id);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get('token')?.value;
  const token    = rawToken ? decodeURIComponent(rawToken) : null;

  // ── تحليل الـ token ───────────────────────────────────
  let validToken = false;
  let userRole   = '';

  if (token) {
    const payload = decodeToken(token);
    if (payload && hasUserId(payload) && isTokenAlive(payload)) {
      validToken = true;
      userRole   = payload.user?.role ?? '';
    }
  }

  // ── مسارات عامة ───────────────────────────────────────
  if (isPublic(pathname)) {
    // مسجّل + يحاول تفتح login أو register → أرسله لـ browse
    if (validToken && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/browse', request.url));
    }
    return NextResponse.next();
  }

  // ── مسارات محمية ───────────────────────────────────────
  if (isProtected(pathname) || isAdmin(pathname)) {
    if (!validToken) {
      // لا يوجد token أو منتهي → إلى صفحة الدخول
      const url = new URL('/login', request.url);
      if (token) url.searchParams.set('expired', 'true'); // كان موجود لكن انتهى
      else        url.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(url);
      if (token) res.cookies.delete('token'); // امسح الـ cookie المنتهي
      return res;
    }

    // Admin check
    if (isAdmin(pathname)) {
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        return NextResponse.redirect(new URL('/browse', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
