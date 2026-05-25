// src/middleware.ts
// ✅ Fix #1 — NEXT_PUBLIC_JWT_SECRET → JWT_ACCESS_SECRET (server-only، لا يُحقن في bundle)
// ✅ Fix #2 — Admin Gate: يعتمد على refreshToken (موجود دائماً) + API route للـ role check
// ✅ Fix #3 — hasSession: يعتمد على refreshToken httpOnly وهو الأصح معمارياً
// ✅ Fix #4 — matcher شامل لكل المسارات المحمية

import { NextResponse, type NextRequest } from 'next/server';

// ─── تعريف المسارات ────────────────────────────────────────────
const PROTECTED_PATHS = [
  '/dashboard',
  '/profile',
  '/donate',
  '/my-items',
  '/add-item',
  '/edit-item',
];

const AUTH_ONLY_PATHS = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
];

const ADMIN_PATHS = ['/admin'];

// ─── ملاحظة معمارية مهمة ──────────────────────────────────────
// ❌ لا نستخدم jwtVerify في middleware بعد الآن للأسباب التالية:
//
//    1. Access Token في ذاكرة React — غير متاح للـ Edge Runtime
//    2. JWT_ACCESS_SECRET يجب أن يبقى server-only في /api routes فقط
//    3. refreshToken httpOnly = مؤشر جلسة كافٍ وموثوق
//    4. التحقق الحقيقي من الـ role يحدث في API routes بالـ requireAdmin middleware
//
// ✅ المعمارية الصحيحة:
//    middleware.ts  → يتحقق من وجود جلسة فقط (refreshToken cookie)
//    /api routes    → يتحقق من صلاحية التوكن والـ role عبر authMiddleware
//    Admin pages    → أول API call فيها سيرفض بـ 403 لو المستخدم مش admin

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PATHS.some(p => pathname.startsWith(p));
  const isAdmin     = ADMIN_PATHS.some(p => pathname.startsWith(p));

  // ✅ المؤشر الوحيد الموثوق: refreshToken httpOnly cookie
  // هذا الكوكي لا يمكن قراءته من JavaScript في المتصفح
  // ويُرسَل تلقائياً مع كل طلب → وجوده = جلسة نشطة
  // غيابه = المستخدم غير مسجّل أو انتهت جلسته
  const hasSession = !!request.cookies.get('refreshToken')?.value;

  // ─── المسارات المحمية بدون جلسة → redirect للـ login ─────────
  if ((isProtected || isAdmin) && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── صفحات Login/Register مع جلسة نشطة → redirect للـ dashboard ─
  if (isAuthOnly && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ─── مسارات الأدمن ────────────────────────────────────────────
  // ✅ التصميم الجديد: middleware يتحقق من الجلسة فقط
  // التحقق من الـ role يحدث داخل الصفحة عبر أول API call
  //
  // لماذا؟
  //  - Access Token في ذاكرة React → غير متاح هنا
  //  - JWT_ACCESS_SECRET يجب أن لا يُقرأ في Edge للأمان
  //  - requireAdmin في Backend سيرفض بـ 403 لو المستخدم مش admin
  //  - الصفحة ستعرض NotAuthorized component بناءً على الـ 403
  //
  // ملاحظة: لو أردت تحقق فوري في Edge مستقبلاً، الحل الصحيح هو:
  //   - تخزين role في cookie منفصلة غير httpOnly (قابلة للقراءة في Edge)
  //   - أو استخدام JWT_ACCESS_SECRET كـ server-only env مع jose في /api routes فقط
  if (isAdmin && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ─── matcher: حدد المسارات التي يعمل عليها الـ middleware ────────
// ✅ نستخدم قائمة صريحة بدل regex شامل لتحسين الأداء
// ✅ نستثني _next/static و _next/image و favicon.ico و api/ تلقائياً
export const config = {
  matcher: [
    // المسارات المحمية
    '/dashboard/:path*',
    '/profile/:path*',
    '/donate/:path*',
    '/my-items/:path*',
    '/add-item/:path*',
    '/edit-item/:path*',
    // مسارات الأدمن
    '/admin/:path*',
    // صفحات المصادقة (لمنع المسجّلين من الوصول)
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ],
};