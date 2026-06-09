// src/middleware.ts (مُصلَح)
import { NextResponse, type NextRequest } from 'next/server';
import { isProtectedPath, isAuthOnlyPath } from '@/config/routes';

const hasSession = (request: NextRequest): boolean => {
  // ✅ session_active هي الـ presence signal الوحيد المتاح في Edge Runtime
  // Access Token في memory — لا يُقرأ هنا
  // Refresh Token httpOnly — لا يُقرأ هنا
  // session_active هي الحل الصحيح للـ middleware
  const signal = request.cookies.get('session_active')?.value;
  return signal === '1' || signal === 'true';
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = isProtectedPath(pathname);
  const isAuthOnly  = isAuthOnlyPath(pathname);
  const loggedIn    = hasSession(request);

  if (isProtected && !loggedIn) {
    const loginUrl = new URL('/login', request.url);

    const isInternal = pathname.startsWith('/') &&
                       !pathname.startsWith('//') &&
                       !pathname.startsWith('/\\');
    const safeRedirect = isInternal ? pathname : '/browse';
    loginUrl.searchParams.set('redirect', safeRedirect);

    if (request.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(loginUrl);
    }
    return new NextResponse(
      JSON.stringify({ message: 'Unauthorized', code: 'NOT_AUTHENTICATED' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  if (isAuthOnly && loggedIn) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)'],
};