// src/middleware.ts — النسخة النهائية الصحيحة
import { NextResponse, type NextRequest } from 'next/server';
import { isProtectedPath, isAuthOnlyPath } from '@/config/routes';

const hasSession = (request: NextRequest): boolean => {
  const signal = request.cookies.get('session_active')?.value;
  return signal === '1' || signal === 'true';
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = isProtectedPath(pathname);
  const isAuthOnly  = isAuthOnlyPath(pathname);
  const loggedIn    = hasSession(request);

  // 1. مسار محمي والمستخدم غير مسجّل
  if (isProtected && !loggedIn) {
    // ✅ طلبات الـ API الداخلية (RSC / fetch) لا تُعاد توجيهها
    const isHtmlRequest = request.headers.get('accept')?.includes('text/html') ?? false;
    const isNavigation  = request.headers.get('sec-fetch-mode') === 'navigate';

    if (isHtmlRequest || isNavigation) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return new NextResponse(
      JSON.stringify({ message: 'Unauthorized', code: 'NOT_AUTHENTICATED' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  // 2. مسار خاص بغير المسجّلين والمستخدم مسجّل بالفعل
  if (isAuthOnly && loggedIn) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)'],
};