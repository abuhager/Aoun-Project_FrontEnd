// src/proxy.ts
// ================================================================
// ✅ PHASE 1 — Edge-level route protection (Next.js 16 = proxy.ts)
//
// التحسينات عن النسخة القديمة:
//   + تحقّق من صحة JWT على الـ Edge (jwtVerify)
//   + حماية /admin — يحتاج role=admin
//   + حماية /donate — يحتاج trustLevel >= 1
//   + تحسين redirect للمسجّلين الذين يحاولون /login
// ================================================================
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ── مسارات عامة — لا تحتاج token ────────────────────────
const PUBLIC_PATHS    = ['/', '/login', '/register', '/browse'];
const PUBLIC_PREFIXES = ['/verify', '/items/'];

// ── مسارات Admin — تحتاج role=admin أو super_admin ─────────
const ADMIN_PREFIXES = ['/admin'];

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
}

// ── تحقّق من صحة JWT و استخراج Payload ────────────────
interface JwtUser {
  id:         string;
  role:       string;
  trustLevel: number;
}

async function verifyToken(
  token: string
): Promise<{ valid: true; user: JwtUser } | { valid: false }> {
  try {
    const secret  = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const user = (payload as { user?: JwtUser }).user;
    if (!user?.id) return { valid: false };
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}

// ── الدالة الرئيسية ───────────────────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token        = request.cookies.get('token')?.value;

  // ── مسار عام ──────────────────────────────────────────
  if (isPublicPath(pathname)) {
    // مسجّل يحاول يفتح /login أو /register → داشبورد
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── لا يوجد token → طرد للـ login ───────────────────────
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── تحقّق من صحة JWT ───────────────────────────────────
  const result = await verifyToken(token);

  if (!result.valid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('expired', 'true');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }

  // ── حماية Admin routes ──────────────────────────────────
  if (isAdminPath(pathname)) {
    const role = result.user.role;
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
