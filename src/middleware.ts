// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { isProtectedPath, isAuthOnlyPath } from '@/config/routes';

// ✅ session_active = presence signal يضبطه Backend مع كل refresh/login ناجح
// accessToken في memory فقط (لا يمكن للـ Middleware قراءته — Edge Runtime)
const hasSession = (request: NextRequest): boolean => {
  const signal = request.cookies.get('session_active')?.value;
  return signal === '1' || signal === 'true';
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = isProtectedPath(pathname);
  const isAuthOnly  = isAuthOnlyPath(pathname);
  const loggedIn    = hasSession(request);

  // 1. مسار محمي والمستخدم غير مسجل دخول
  if (isProtected && !loggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    if (request.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(loginUrl);
    }

    return new NextResponse(
      JSON.stringify({ message: 'Unauthorized', code: 'NOT_AUTHENTICATED' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  // 2. مسار خاص بغير المسجلين (مثل /login) والمستخدم مسجل بالفعل
  if (isAuthOnly && loggedIn) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)'],
};