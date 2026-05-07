// src/middleware.ts — Next.js Edge Middleware
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS    = ["/", "/login", "/register", "/browse", "/forgot-password"];
const PUBLIC_PREFIXES = ["/verify", "/items/", "/reset-password", "/_next", "/api"];
const PROTECTED       = ["/dashboard", "/add-item", "/edit-item", "/profile"];
const ADMIN           = ["/admin"];

function isPublic(p: string) {
  return PUBLIC_PATHS.includes(p) || PUBLIC_PREFIXES.some((x) => p.startsWith(x));
}
function isProtected(p: string) {
  return PROTECTED.some((x) => p.startsWith(x));
}
function isAdmin(p: string) {
  return ADMIN.some((x) => p.startsWith(x));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  // isLoggedIn: cookie خفيفة يزرعها الفرونت بعد اللوجن
  // refreshToken/token: fallback للتوافق مع الكوميتات القديمة
  const hasSession =
    request.cookies.has("isLoggedIn") ||
    request.cookies.has("refreshToken") ||
    request.cookies.has("token");

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
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
