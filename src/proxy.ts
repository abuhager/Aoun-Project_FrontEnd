// src/proxy.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS    = ['/', '/login', '/register'];
const PUBLIC_PREFIXES = ['/verify'];

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

// ✅ Next.js 16 → الاسم proxy وليس middleware
export function proxy(request: NextRequest) {
  const token            = request.cookies.get('token')?.value;
  const { pathname }     = request.nextUrl;

  if (!isPublicPath(pathname) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/browse',
    '/dashboard',
    '/add-item',
    '/edit-item/:path*',
    '/items/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
};