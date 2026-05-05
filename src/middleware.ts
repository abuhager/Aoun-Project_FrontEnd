// src/middleware.ts — Next.js Edge Middleware
// ✅ هذا هو الملف الوحيد الذي ينفّذه Next.js كـ middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS    = ['/', '/login', '/register', '/browse', '/forgot-password'];
const PUBLIC_PREFIXES = ['/verify', '/items/', '/reset-password', '/_next', '/api'];
const PROTECTED      = ['/dashboard', '/add-item', '/edit-item', '/profile'];
const ADMIN          = ['/admin'];

function isPublic(p: string) {
  return PUBLIC_PATHS.includes(p) || PUBLIC_PREFIXES.some(x => p.startsWith(x));
}
function isProtected(p: string) {
  return PROTECTED.some(x => p.startsWith(x));
}
function isAdmin(p: string) {
  return ADMIN.some(x => p.startsWith(x));
}

interface JwtUser { id: string; role: string; }

async function verify(token: string): Promise<{ ok: true; user: JwtUser } | { ok: false }> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const u = (payload as { user?: JwtUser }).user;
    if (!u?.id) return { ok: false };
    return { ok: true, user: u };
  } catch { return { ok: false }; }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // ── مسار عام ───────────────────────────────────────────────────
  if (isPublic(pathname)) {
    if (token && (pathname === '/login' || pathname === '/register')) {
      const r = await verify(token);
      // ✅ فقط redirect لو الـ token صحيح 100% — منع لوب
      if (r.ok) return NextResponse.redirect(new URL('/browse', request.url));
    }
    return NextResponse.next();
  }

  // ── مسار محمي / Admin ───────────────────────────────────────────
  if (isProtected(pathname) || isAdmin(pathname)) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    const r = await verify(token);
    if (!r.ok) {
      const url = new URL('/login', request.url);
      url.searchParams.set('expired', 'true');
      const res = NextResponse.redirect(url);
      res.cookies.delete('token');
      return res;
    }
    if (isAdmin(pathname)) {
      const role = r.user.role;
      if (role !== 'admin' && role !== 'super_admin') {
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
