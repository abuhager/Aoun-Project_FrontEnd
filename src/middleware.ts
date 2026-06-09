// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
// ✅ استيراد الفلاتر المشتركة من مصدر الحقيقة الموحد
import { isProtectedPath, isAuthOnlyPath } from '@/config/routes';

// الـ Backend يضبطه مع كل /auth/refresh ناجح كـ presence signal
const hasSession = (request: NextRequest): boolean => {
  const signal = request.cookies.get('session_active')?.value;
  return signal === '1' || signal === 'true';
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ استخدام الدوال المشتركة بدلاً من الميثود المحلية .some
  const isProtected = isProtectedPath(pathname);
  const isAuthOnly   = isAuthOnlyPath(pathname);
  const loggedIn     = hasSession(request);

  // ── محمي وغير مسجّل → توجيه للـ login ──
  if (isProtected && !loggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    // طلبات HTML → redirect | طلبات API/Fetch → 401 JSON
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