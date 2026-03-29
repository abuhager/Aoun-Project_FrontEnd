import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. استخراج التوكن من الـ Cookies (الأفضل تخزين التوكن بالـ Cookies ليعمل الميدل وير صح)
  // ملاحظة: لو بتستخدم LocalStorage، الميدل وير ما بشوفه، فرح نعتمد طريقة الـ Client Check تحت
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl;

  // 2. الصفحات المسموحة للجميع (Public)
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/verify');

  // 3. إذا الصفحة مش عامة واليوزر ما عنده توكن -> طيره عاللوجن
  if (!isPublicPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// تحديد المسارات اللي الشرطي رح يراقبها
export const config = {
  matcher: ['/browse', '/items/:id*', '/add-item', '/profile/:path*'],
};