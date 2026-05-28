// src/components/Navbar/index.tsx
"use client";

import Link from "next/link";
import { useNavbar } from "./useNavbar";
import NotificationBell from "@/components/NotificationBell";

const NAV_LINKS = [
  { href: "/#how-it-works", icon: "help",            label: "كيف نعمل؟",    authRequired: false },
  { href: "/hubs",          icon: "warehouse",        label: "مراكز التسليم", authRequired: false }, // ✅ إضافة
  { href: "/leaderboard",   icon: "leaderboard",    label: "المتصدرون",    authRequired: false }, // ✅ جديد
  { href: "/browse",        icon: "explore",          label: "تصفح الأغراض", authRequired: true  },
  { href: "/add-item",      icon: "add_box",          label: "تبرع الآن",    authRequired: true  },
  { href: "/dashboard",     icon: "account_circle",   label: "حسابي",        authRequired: true  },
] as const;

export default function Navbar() {
  const {
    pathname,
    isLoggedIn,
    isMounted,
    firstName,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleLogout,
  } = useNavbar();

  const visibleLinks = NAV_LINKS.filter((l) => {
    if (!l.authRequired) return true;
    return isMounted ? isLoggedIn : false;
  });

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-100 bg-white/80 backdrop-blur-md border-b border-[#edeeef] px-4 md:px-8 h-16 md:h-20 flex items-center justify-between"
      dir="rtl"
    >
      <div className="flex items-center gap-4 md:gap-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined text-white text-2xl">volunteer_activism</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-[#191c1d]">عـون</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {visibleLinks
            .filter((l) => l.href !== "/add-item" && l.href !== "/dashboard")
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 text-sm font-black transition-all ${
                  pathname === l.href ? "text-primary" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{l.icon}</span>
                {l.label}
              </Link>
            ))}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        {!isMounted ? (
          <div className="w-24 h-10 rounded-full bg-gray-100 animate-pulse" />
        ) : isLoggedIn ? (
          <>
            {pathname !== "/add-item" && (
              <Link
                href="/add-item"
                className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                تبرع الآن
              </Link>
            )}

            <Link
              href="/dashboard"
              className={`flex items-center gap-2 group px-2 py-1 rounded-xl transition-all ${
                pathname === "/dashboard" ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-gray-50"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10">
                <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
              </div>
              <span className="text-xs font-black text-[#191c1d] group-hover:text-primary">{firstName}</span>
            </Link>

            <NotificationBell />

            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="text-gray-300 hover:text-red-500 transition-colors p-1"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-md">
            تسجيل الدخول
          </Link>
        )}
      </div>

      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-expanded={isMobileMenuOpen}
        aria-label="القائمة"
        className="md:hidden flex items-center justify-center text-[#191c1d] hover:text-primary transition-colors p-1"
      >
        <span className="material-symbols-outlined text-3xl">
          {isMobileMenuOpen ? "close" : "menu"}
        </span>
      </button>

      <div
        className={`absolute top-full left-0 right-0 bg-white border-b border-[#edeeef] shadow-lg md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-125 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 font-bold text-sm">
          {visibleLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 p-3 rounded-xl transition-colors ${
                pathname === l.href ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{l.icon}</span>
              {l.label === "حسابي" ? `حسابي (${firstName})` : l.label}
            </Link>
          ))}

          {!isMounted ? (
            <div className="bg-gray-100 h-12 rounded-xl mt-2 animate-pulse" />
          ) : isLoggedIn ? (
            <>
              <div className="h-px w-full bg-gray-100 my-1" />

              <div className="flex items-center gap-2 p-3">
                <NotificationBell />
                <span className="text-sm text-gray-600 font-bold">الإشعارات</span>
              </div>

              <div className="h-px w-full bg-gray-100 my-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-3 rounded-xl text-red-500 hover:bg-red-50 text-right transition-colors"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                تسجيل الخروج
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-primary text-white px-4 py-3 rounded-xl text-center shadow-md mt-2"
            >
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}