// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { isProtectedPath, isAuthOnlyPath } from '@/config/routes';

const hasValidTokenStructure = (request: NextRequest): boolean => {
  // ✅ الـ Middleware يقرأ الـ httpOnly cookies بدون أي مشاكل
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) return false;

  // تحقق هيكلي سريع للتأكد أنه JWT (ثلاثة أجزاء يفصلها نقطة)
  const parts = accessToken.split('.');
  return parts.length === 3 && parts.every(p => p.length > 0);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = isProtectedPath(pathname);
  const isAuthOnly  = isAuthOnlyPath(pathname);
  const loggedIn    = hasValidTokenStructure(request);

  // 1. مسار محمي والمستخدم غير مسجل دخول
  if (isProtected && !loggedIn) {
    const loginUrl = new URL('/login', request.url);
    
    // استخدام pathname مباشرة (آمن لأن Next.js يجلبها من النطاق الداخلي للتطبيق فقط)
    // المتصفح سيتكفل بالـ Encoding تلقائياً عبر searchParams
    loginUrl.searchParams.set('redirect', pathname);

    // إذا كان الطلب لتصفح صفحة HTML (وليس طلب API أو Fetch خلفي)
    if (request.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(loginUrl);
    }
    
    // لطلبات الـ API الخلفية المتوقعة من الـ Client Components
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
  // استثناء الملفات الثابتة والـ APIs
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)'],
};