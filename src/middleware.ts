// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS    = ["/", "/browse"];
const PUBLIC_PREFIXES = ["/verify", "/items/", "/_next", "/api"];
const AUTH_PATHS      = ["/login", "/register", "/forgot-password", "/reset-password"];
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

  // ✅ refreshToken httpOnly فقط — حذفنا isLoggedIn و token
  const hasSession = request.cookies.has("refreshToken");

  if (isAuth(pathname)) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isPublic(pathname)) return NextResponse.next();

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