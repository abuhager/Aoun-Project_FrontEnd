// src/components/Navbar/index.tsx
"use client";

import Link from "next/link";
import { useNavbar } from "./useNavbar";
import NotificationBell from "@/components/NotificationBell";
import { useEffect, useRef } from "react";

const NAV_LINKS = [
  { href: "/#how-it-works",     icon: "help",              label: "كيف نعمل؟",      authRequired: false },
  { href: "/hubs",              icon: "warehouse",          label: "مراكز التسليم",  authRequired: false },
  { href: "/leaderboard",       icon: "leaderboard",        label: "المتصدرون",      authRequired: false },
  { href: "/browse",            icon: "explore",            label: "تصفح الأغراض",  authRequired: true  },
  { href: "/donation-requests", icon: "volunteer_activism", label: "طلبات التبرع",   authRequired: true  },
] as const;

export default function Navbar() {
  const {
    pathname,
    isLoggedIn,
    isMounted,
    firstName,
    userRole,
    user,
    isLogoOnlyPage,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
    handleLogout,
  } = useNavbar();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileDropdownOpen, setIsProfileDropdownOpen]);

  if (isLogoOnlyPage) {
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-100 bg-white/80 backdrop-blur-md border-b border-[#edeeef] px-4 md:px-8 h-16 md:h-20 flex items-center justify-start"
        dir="rtl"
      >
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined text-white text-2xl">volunteer_activism</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-[#191c1d]">عـون</span>
        </Link>
      </nav>
    );
  }

  const visibleLinks = NAV_LINKS.filter((l) => {
    if (!l.authRequired) return true;
    return isMounted ? isLoggedIn : false;
  });

  const isAdmin    = isMounted && userRole === "admin";
  const userLevel  = user?.gamification?.level ?? 1;
  const userBadge  = user?.gamification?.badge ?? "🌱";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-100 bg-white/90 backdrop-blur-md border-b border-[#edeeef] px-4 md:px-8 h-16 md:h-20 flex items-center justify-between shadow-sm"
      dir="rtl"
    >
      {/* ── Logo + روابط Desktop ── */}
      <div className="flex items-center gap-6 md:gap-10">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
            <span className="material-symbols-outlined text-white text-xl md:text-2xl">volunteer_activism</span>
          </div>
          <span className="text-lg md:text-xl font-black tracking-tighter text-[#191c1d]">عـون</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {visibleLinks.map((l) => {
            const isActive = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 group ${
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-on-surface-variant hover:text-primary hover:bg-gray-50"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-110"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {l.icon}
                </span>
                {l.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Actions ── */}
      <div className="hidden md:flex items-center gap-2">
        {!isMounted ? (
          <div className="w-24 h-9 rounded-full bg-gray-100 animate-pulse" />
        ) : isLoggedIn ? (
          <>
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                الإدارة
              </Link>
            )}

            {pathname !== "/add-item" && (
              <Link
                href="/add-item"
                className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg hover:bg-primary/90 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                تبرع الآن
              </Link>
            )}

            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 ${
                  isProfileDropdownOpen || pathname === "/dashboard"
                    ? "bg-primary/8 ring-1 ring-primary/20"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/15 overflow-hidden">
                    {user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={firstName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        account_circle
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -left-1 text-[10px] leading-none bg-white rounded-full border border-gray-100 px-0.5 shadow-sm">
                    {userBadge}
                  </span>
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-black text-[#191c1d] leading-tight">{firstName}</span>
                  <span className="text-[10px] text-primary font-bold leading-tight">المستوى {userLevel}</span>
                </div>

                <span
                  className={`material-symbols-outlined text-gray-400 text-[16px] transition-transform duration-200 ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#edeeef] overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-4 py-3 bg-gradient-to-l from-primary/5 to-transparent border-b border-[#edeeef]">
                    <p className="text-xs font-black text-[#191c1d] truncate">{user?.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1.5">
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition-colors ${
                        pathname === "/dashboard"
                          ? "text-primary bg-primary/5"
                          : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        dashboard
                      </span>
                      لوحة التحكم
                    </Link>

                    <Link
                      href="/profile/edit"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition-colors ${
                        pathname === "/profile/edit"
                          ? "text-primary bg-primary/5"
                          : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                      تعديل الملف الشخصي
                    </Link>

                    <div className="h-px bg-[#edeeef] my-1 mx-3" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-bold text-on-surface-variant hover:text-primary px-3 py-2 rounded-xl transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95"
            >
              إنشاء حساب
            </Link>
          </div>
        )}
      </div>

      {/* ── Mobile: إشعارات + Toggle ── */}
      <div className="md:hidden flex items-center gap-1">
        {isMounted && isLoggedIn && <NotificationBell />}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="القائمة"
          className="flex items-center justify-center text-[#191c1d] hover:text-primary transition-colors p-1.5 rounded-xl hover:bg-gray-50"
        >
          <span className="material-symbols-outlined text-2xl">
            {isMobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={`absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-[#edeeef] shadow-xl md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-0.5 px-4 py-3">

          {/* Profile header — Mobile */}
          {isMounted && isLoggedIn && (
            <div className="flex items-center gap-3 p-3 mb-1 bg-primary/5 rounded-2xl">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/15 overflow-hidden">
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={firstName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      account_circle
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 text-xs bg-white rounded-full border border-gray-100 px-0.5 shadow-sm">
                  {userBadge}
                </span>
              </div>
              <div>
                <p className="text-sm font-black text-[#191c1d]">{user?.name}</p>
                <p className="text-xs text-primary font-bold">المستوى {userLevel}</p>
              </div>
            </div>
          )}

          {/* روابط */}
          {visibleLinks.map((l) => {
            const isActive = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-bold ${
                  isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {l.icon}
                </span>
                {l.label}
              </Link>
            );
          })}

          {!isMounted ? (
            <div className="bg-gray-100 h-12 rounded-xl mt-2 animate-pulse" />
          ) : isLoggedIn ? (
            <>
              <div className="h-px w-full bg-[#edeeef] my-1" />

              <Link
                href="/add-item"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 text-primary font-bold text-sm hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                تبرع بغرض الآن
              </Link>

              <Link
                href="/profile/edit"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-bold ${
                  pathname === "/profile/edit" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                تعديل الملف الشخصي
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-bold ${
                  pathname === "/dashboard" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                لوحة التحكم
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-bold ${
                    pathname.startsWith("/admin") ? "bg-red-100 text-red-600" : "text-red-500 hover:bg-red-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                  لوحة الإدارة
                </Link>
              )}

              <div className="h-px w-full bg-[#edeeef] my-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 text-sm font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                تسجيل الخروج
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-3 rounded-xl text-sm font-bold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-primary text-white px-4 py-3 rounded-xl text-center text-sm font-bold shadow-md"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}