// src/proxy.ts
// ================================================================
// ✅ PHASE 1 — Edge-level route protection
//
// إصلاحات هذه النسخة:
//   - matcher مُصحَّح: يستثني _next/* و static assets بشكل صريح
//   - منع redirect loop: إذا الوجهة هي /login لا نعمل redirect مجدداً
//   - /dashboard و /add-item و /profile محمية صراحةً
// ================================================================
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ── مسارات عامة كاملة ────────────────────────────────────────
const PUBLIC_PATHS = ['/', '/login', '/register', '/browse', '/forgot-password'];
const PUBLIC_PREFIXES = ['/verify', '/items/', '/reset-password'];

// ── مسارات تحتاج تسجيل دخول ──────────────────────────────────
const PROTECTED_PREFIXES = ['/dashboard', '/add-item', '/edit-item', '/profile'];

// ── مسارات Admin ──────────────────────────────────────────────
const ADMIN_PREFIXES = ['/admin'];

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
}

// ── تحقّق من صحة JWT ─────────────────────────────────────────
interface JwtUser {
  id: string;
  role: string;
  trustLevel?: number;
}

async function verifyToken(
  token: string
): Promise<{ valid: true; user: JwtUser } | { valid: false }> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const user = (payload as { user?: JwtUser }).user;
    if (!user?.id) return { valid: false };
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}

// ── الدالة الرئيسية ───────────────────────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // ── 1. مسار عام ──────────────────────────────────────────────
  if (isPublicPath(pathname)) {
    // مسجّل يحاول يفتح /login أو /register → داشبورد
    if (token && (pathname === '/login' || pathname === '/register')) {
      const result = await verifyToken(token);
      if (result.valid) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // ── 2. مسار محمي أو Admin — يحتاج token ──────────────────────
  if (isProtectedPath(pathname) || isAdminPath(pathname)) {
    // لا يوجد token → طرد للـ login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // تحقّق من صحة JWT
    const result = await verifyToken(token);

    if (!result.valid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('expired', 'true');
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      return response;
    }

    // حماية Admin routes
    if (isAdminPath(pathname)) {
      const role = result.user.role;
      if (role !== 'admin' && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  }

  // ── 3. أي مسار آخر غير معروف → اسمح بالمرور ──────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * تطابق كل المسارات ما عدا:
     * - _next/static  (ملفات CSS/JS المبنية)
     * - _next/image   (Next.js image optimizer)
     * - favicon.ico
     * - ملفات الصور والـ assets الثابتة
     */
    '/((?!_next/static|_next/image|favicon\.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
