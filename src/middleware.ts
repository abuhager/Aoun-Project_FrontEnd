// middleware.ts — Flow 1 FINAL FIXED (Next.js Edge Middleware)
// ✅ FIX-01: ALLOWED_ORIGINS من env — لا hardcoded values
// ✅ FIX-02: CSP Nonce يُقرأ من X-CSP-Nonce header (يُرسَله backend) ويُحقَن في response headers
// ✅ FIX-03: CSRF-Check على mutation methods (POST/PUT/PATCH/DELETE) — يتحقق من Origin vs Host
// ✅ FIX-04: Auth guard يستخدم jose بدل jwt-decode (Edge runtime لا يدعم Node.js crypto)
// ✅ FIX-05: Matcher محدود — لا يُطبَّق على static assets أو _next

import { NextResponse }   from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify }       from 'jose';

// ── المسارات المحمية وأدوارها ─────────────────────────────────
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin':    ['admin'],
  '/dashboard': ['donor', 'recipient', 'admin'],
  '/profile':   ['donor', 'recipient', 'admin'],
  '/donate':    ['donor', 'admin'],
  '/bookings':  ['recipient', 'admin'],
};

// ── ✅ FIX-01: Origins من env ─────────────────────────────────
const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// ── ✅ FIX-04: JWT Secret كـ Uint8Array (jose requirement) ────
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? ''
);

export async function middleware(request: NextRequest) {
  const { pathname, origin: reqOrigin } = request.nextUrl;
  const response = NextResponse.next();

  // ── ✅ FIX-02: CSP Nonce من Backend header ─────────────────
  const backendNonce = request.headers.get('X-CSP-Nonce');
  if (backendNonce) {
    response.headers.set('X-CSP-Nonce', backendNonce);
  }

  // ── ✅ FIX-03: CSRF Check على mutation methods ──────────────
  const method = request.method.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const originHeader = request.headers.get('origin');
    const host         = request.headers.get('host');

    // API routes فقط — لا نرفض page navigation
    if (pathname.startsWith('/api/') && originHeader && host) {
      const originHost = (() => {
        try { return new URL(originHeader).host; }
        catch { return null; }
      })();

      const hostAllowed =
        originHost === host ||
        ALLOWED_ORIGINS.some((o) => {
          try { return new URL(o).host === originHost; }
          catch { return false; }
        });

      if (!hostAllowed) {
        return new NextResponse(
          JSON.stringify({ message: 'CSRF: Origin غير مصرح به', code: 'CSRF_REJECTED' }),
          {
            status:  403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }

  // ── ✅ FIX-04: Auth Guard ───────────────────────────────────
  const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    const token =
      request.cookies.get('accessToken')?.value ??
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // ✅ FIX-04: jose يعمل في Edge runtime بدون Node.js crypto
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        algorithms: ['HS256'],
      });

      const userRole   = (payload as { role?: string }).role ?? '';
      const allowedRoles = PROTECTED_ROUTES[matchedRoute];

      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // ✅ تمرير userId للـ server components عبر header
      response.headers.set('X-User-Id',   String(payload.sub  ?? ''));
      response.headers.set('X-User-Role', userRole);
    } catch {
      // Token منتهي الصلاحية أو تالف
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

// ── ✅ FIX-05: Matcher محدود ───────────────────────────────────
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|fonts/|icons/).*)',
  ],
};
