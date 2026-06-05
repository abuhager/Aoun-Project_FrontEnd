// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/add-item',
  '/admin',
  '/donate',
  '/my-items',
];

const AUTH_ONLY_PREFIXES = [
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
  '/reset-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PREFIXES.some(p => pathname.startsWith(p));

  const refreshCookie = request.cookies.get('refreshToken');
  const hasSession    = !!refreshCookie?.value;
  
  // ✅ التحقق من وجود القيمة وصحتها المبدئية (JWT length protection)
  const isValidToken  = hasSession && refreshCookie.value.length > 50;

  // ❌ حالة 1: يحاول الدخول لصفحة محمية وجلسته منتهية أو غير موجودة
  if (isProtected && !isValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    // إذا كان الطلب عبارة عن Fetch/API داخلي من Next.js، نرجع 401 بدل الـ Redirect الكامل لتجنب مشاكل الـ CORS بالفرونت
    if (request.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(loginUrl);
    }
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  // 🔄 حالة 2: المستخدم مسجل بالفعل ويحاول دخول صفحات Auth (مثل /login)
  if (isAuthOnly && isValidToken) {
    return NextResponse.redirect(new URL('/browse', request.url));
  }

  return NextResponse.next();
}

// ✅ الـ Matcher الموحد لمنع تشغيل الـ Middleware على ملفات الـ Assets والـ Static
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)',
  ],
};