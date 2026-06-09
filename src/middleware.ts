// src/middleware.ts ✅ مصحّح
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard', '/profile', '/add-item',
  '/admin', '/donate', '/my-items',
];

const AUTH_ONLY_PREFIXES = [
  '/login', '/register', '/verify',
  '/forgot-password', '/reset-password',
];

// ✅ الإصلاح الجوهري:
// refreshToken = httpOnly → غير قابل للقراءة هنا في Edge Runtime
// الحل: نستخدم "session_active" cookie غير httpOnly كـ presence signal فقط
// لا يحتوي على بيانات حساسة — مجرد "1" أو "true"
// الـ Backend يضبطه مع كل /auth/refresh ناجح
const hasSession = (request: NextRequest): boolean => {
  const signal = request.cookies.get('session_active')?.value;
  // نتحقق فقط من الوجود — القيمة "1" أو "true"
  return signal === '1' || signal === 'true';
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PREFIXES.some(p  => pathname.startsWith(p));
  const loggedIn    = hasSession(request);

  // ── محمي وغير مسجّل → توجيه للـ login ──
  if (isProtected && !loggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    // ✅ طلبات HTML → redirect | طلبات API/Fetch → 401 JSON
    if (request.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(loginUrl);
    }
    return new NextResponse(
      JSON.stringify({ message: 'Unauthorized', code: 'NOT_AUTHENTICATED' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  // ── صفحات Auth ومسجّل → توجيه للـ browse ──
  if (isAuthOnly && loggedIn) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)'],
};