import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/profile', '/donate', '/my-items'];
const AUTH_ONLY_PATHS = ['/login', '/register', '/verify-email'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PATHS.some(p => pathname.startsWith(p));

  // ✅ اقرأ aoun_user — الكوكي الوحيد المتاح في Edge Runtime
  const userCookie = request.cookies.get('aoun_user')?.value;
  let isLoggedIn   = false;
  let userRole     = 'user';

  if (userCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(userCookie));
      if (parsed?._id) {
        isLoggedIn = true;
        userRole   = parsed.role ?? 'user';
      }
    } catch {
      isLoggedIn = false;
    }
  }

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/donate/:path*',
    '/my-items/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/verify-email',
  ],
};