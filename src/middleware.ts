// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. المسارات العامة التي يمكن للجميع (مسجل أو غير مسجل) الدخول إليها
const PUBLIC_PATHS    = ["/", "/browse"];
const PUBLIC_PREFIXES = ["/verify", "/items/", "/_next", "/api"];

// 2. مسارات المصادقة (تمنع المستخدم المسجل من دخولها)
const AUTH_PATHS      = ["/login", "/register", "/forgot-password", "/reset-password"];

// 3. المسارات المحمية
const PROTECTED       = ["/dashboard", "/add-item", "/edit-item", "/profile"];
const ADMIN           = ["/admin"];

function isPublic(p: string) {
  return PUBLIC_PATHS.includes(p) || PUBLIC_PREFIXES.some((x) => p.startsWith(x));
}
function isAuth(p: string) {
  return AUTH_PATHS.some((x) => p.startsWith(x));
}
function isProtected(p: string) {
  return PROTECTED.some((x) => p.startsWith(x));
}
function isAdmin(p: string) {
  return ADMIN.some((x) => p.startsWith(x));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession =
    request.cookies.has("isLoggedIn") ||
    request.cookies.has("refreshToken") ||
    request.cookies.has("token");

  // ✅ منع المستخدم المُسجَّل من الدخول لصفحات تسجيل الدخول والتسجيل
  if (isAuth(pathname)) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // إذا لم يكن مسجلاً، دعه يكمل لصفحة الدخول
    return NextResponse.next();
  }

  // السماح بالمرور للمسارات العامة
  if (isPublic(pathname)) return NextResponse.next();

  // حماية مسارات المستخدمين والأدمن
  if (isProtected(pathname) || isAdmin(pathname)) {
    if (!hasSession) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // تجاهل ملفات النظام والصور لتخفيف الضغط عن الـ Middleware
"/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)"  ],
};
