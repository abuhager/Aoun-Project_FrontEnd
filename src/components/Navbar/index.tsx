// src/components/Navbar/index.tsx — ✅ REDESIGNED
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavbar } from "./useNavbar";
import NotificationBell from "@/components/NotificationBell";
import ConversationsDrawer from "@/components/ConversationsDrawer";
import axiosInstance from "@/lib/api/axiosInstance";

const NAV_LINKS = [
  { href: "/#how-it-works", icon: "help", label: "كيف نعمل؟", authRequired: false },
  { href: "/hubs", icon: "warehouse", label: "مراكز التسليم", authRequired: false },
  { href: "/leaderboard", icon: "leaderboard", label: "المتصدرون", authRequired: false },
  { href: "/browse", icon: "explore", label: "تصفح الأغراض", authRequired: true },
  { href: "/donation-requests", icon: "volunteer_activism", label: "طلبات التبرع", authRequired: true },
] as const;

interface ConversationUnreadItem {
  _id: string;
  unread: number;
}

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

  const [chatOpen, setChatOpen] = useState(false);
  const [serverChatUnreadCount, setServerChatUnreadCount] = useState(0);

  const isReadyForUserData = isMounted && isLoggedIn;
  const isAdmin = isReadyForUserData && userRole === "admin";
  const userLevel = user?.gamification?.level ?? 1;
  const userBadge = (user?.gamification as { badge?: string })?.badge ?? "🌱";
  const chatUnreadCount = isReadyForUserData ? serverChatUnreadCount : 0;

  const visibleLinks = useMemo(() => {
    return NAV_LINKS.filter((link) => {
      if (!link.authRequired) return true;
      return isReadyForUserData;
    });
  }, [isReadyForUserData]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axiosInstance.get<ConversationUnreadItem[]>("/api/conversations");
      const rawData =
        response.data && typeof response.data === "object" && "data" in response.data
          ? (response.data as Record<string, unknown>).data
          : response.data;
      const data = Array.isArray(rawData) ? rawData : [];
      return data.reduce((sum, conv) => sum + (conv.unread || 0), 0);
    } catch {
      return 0;
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen, setIsProfileDropdownOpen]);

  useEffect(() => {
    if (!isReadyForUserData) return;
    let cancelled = false;

    fetchUnreadCount()
      .then((total) => {
        if (cancelled) return;
        setServerChatUnreadCount(total);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setServerChatUnreadCount(0);
        let msg = "";
        if (error && typeof error === "object") {
          if ("message" in error) msg = (error as { message: string }).message;
          else if ("code" in error) msg = (error as { code: string }).code;
        }
        if (msg !== "NOT_AUTHENTICATED" && msg !== "AUTH_INIT_TIMEOUT") {
          console.error("fetch navbar unread count error", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isReadyForUserData, fetchUnreadCount]);

  // ─── شكل الـ Logo-only (صفحات المصادقة) ───────────────────────────────────
  if (isLogoOnlyPage) {
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-start
                   border-b border-black/[0.06] bg-white/80 px-4 backdrop-blur-xl
                   md:h-20 md:px-8"
        dir="rtl"
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary
                       shadow-lg shadow-primary/25 transition-all duration-300
                       group-hover:scale-105 group-hover:shadow-primary/40"
          >
            <span className="material-symbols-outlined text-[22px] text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              volunteer_activism
            </span>
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">عـون</span>
        </Link>
      </nav>
    );
  }

  // ─── الـ Navbar الكامل ─────────────────────────────────────────────────────
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between
                 border-b border-black/[0.06] bg-white/85 px-3 backdrop-blur-xl
                 transition-all duration-300 md:h-[68px] md:px-6"
      dir="rtl"
    >

      {/* ── اليسار: الشعار + الروابط ─────────────────────────── */}
      <div className="flex items-center gap-5 md:gap-8">

        {/* شعار المنصة */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary
                       shadow-md shadow-primary/20 transition-all duration-300
                       group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30
                       md:h-10 md:w-10"
          >
            <span
              className="material-symbols-outlined text-[20px] text-white md:text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volunteer_activism
            </span>
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900 md:text-xl">
            عـون
          </span>
        </Link>

        {/* روابط الـ Desktop */}
        <div className="hidden items-center gap-0.5 md:flex">
          {visibleLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative flex items-center gap-1.5 rounded-xl px-3 py-2
                            text-sm font-bold transition-all duration-200
                            ${isActive
                              ? "bg-primary/[0.08] text-primary"
                              : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900"
                            }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform
                              duration-200 group-hover:scale-110
                              ${isActive ? "text-primary" : ""}`}
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {link.icon}
                </span>
                {link.label}

                {/* مؤشر الرابط النشط — نقطة أسفل */}
                {isActive && (
                  <span
                    className="absolute bottom-1 right-1/2 h-1 w-1 translate-x-1/2
                               rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── اليمين: أدوات المستخدم (Desktop) ───────────────────── */}
      <div className="hidden items-center gap-1.5 md:flex">

        {/* حالة التحميل */}
        {!isMounted ? (
          <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-100" />
        ) : isLoggedIn ? (
          <>
            {/* زر لوحة الإدارة */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm
                            font-bold transition-all duration-200
                            ${pathname.startsWith("/admin")
                              ? "bg-red-500 text-white shadow-md shadow-red-500/25"
                              : "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white hover:shadow-md hover:shadow-red-500/25"
                            }`}
              >
                <span className="material-symbols-outlined text-[17px]">
                  admin_panel_settings
                </span>
                الإدارة
              </Link>
            )}

            {/* زر التبرع الرئيسي */}
            {pathname !== "/add-item" && (
              <Link
                href="/add-item"
                className="group flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2
                           text-sm font-bold text-white shadow-md shadow-primary/20
                           transition-all duration-200 hover:bg-primary/90
                           hover:shadow-lg hover:shadow-primary/30 active:scale-95"
              >
                <span
                  className="material-symbols-outlined text-[18px] transition-transform
                             duration-200 group-hover:rotate-90"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add_circle
                </span>
                تبرع الآن
              </Link>
            )}

            {/* زر الدردشة */}
            <button
              onClick={() => setChatOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl
                         text-gray-400 transition-all duration-200
                         hover:bg-gray-100 hover:text-gray-700 active:scale-95"
              aria-label="الرسائل"
              type="button"
            >
              <span className="material-symbols-outlined text-[21px]">chat</span>
              {chatUnreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -left-0.5 flex h-[18px] min-w-[18px]
                             items-center justify-center rounded-full bg-red-500 px-1
                             text-[9px] font-black text-white shadow-sm"
                >
                  {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                </span>
              )}
            </button>

            {/* جرس الإشعارات */}
            <NotificationBell />

            {/* بطاقة الملف الشخصي */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`flex items-center gap-2 rounded-xl px-2 py-1.5
                            transition-all duration-200
                            ${isProfileDropdownOpen || pathname === "/dashboard"
                              ? "bg-primary/[0.08] ring-1 ring-primary/20"
                              : "hover:bg-gray-100/80"
                            }`}
                type="button"
              >
                {/* صورة الأفاتار */}
                <div className="relative shrink-0">
                  <div
                    className="flex h-8 w-8 items-center justify-center overflow-hidden
                               rounded-full border border-primary/20
                               bg-gradient-to-br from-primary/20 to-primary/5"
                  >
                    {user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={firstName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className="material-symbols-outlined text-[18px] text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        account_circle
                      </span>
                    )}
                  </div>
                  {/* شارة المستوى */}
                  <span
                    className="absolute -bottom-1 -left-1 rounded-full border border-white
                               bg-white px-0.5 text-[9px] leading-none shadow-sm"
                  >
                    {userBadge}
                  </span>
                </div>

                {/* معلومات المستخدم */}
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[13px] font-black text-gray-900">{firstName}</span>
                  <span className="mt-0.5 text-[10px] font-semibold text-primary/80">
                    المستوى {userLevel}
                  </span>
                </div>

                {/* سهم التوسيع */}
                <span
                  className={`material-symbols-outlined text-[16px] text-gray-300
                              transition-transform duration-200
                              ${isProfileDropdownOpen ? "-rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>

              {/* قائمة Dropdown المنسدلة */}
              {isProfileDropdownOpen && (
                <div
                  className="absolute top-full left-0 z-50 mt-2 w-56 overflow-hidden
                             rounded-2xl border border-black/[0.07] bg-white
                             shadow-xl shadow-black/[0.08]"
                >
                  {/* رأس القائمة — بيانات المستخدم */}
                  <div
                    className="border-b border-black/[0.06] bg-gradient-to-l
                               from-primary/[0.05] to-transparent px-4 py-3"
                  >
                    <p className="truncate text-[13px] font-black text-gray-900">
                      {user?.name}
                    </p>
                    <p className="truncate text-[11px] text-gray-400">{user?.email}</p>
                  </div>

                  {/* عناصر القائمة */}
                  <div className="py-1.5">
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px]
                                  font-bold transition-colors duration-150
                                  ${pathname === "/dashboard"
                                    ? "bg-primary/[0.07] text-primary"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                    >
                      <span
                        className="material-symbols-outlined text-[17px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        dashboard
                      </span>
                      لوحة التحكم
                    </Link>

                    <Link
                      href="/profile/edit"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px]
                                  font-bold transition-colors duration-150
                                  ${pathname === "/profile/edit"
                                    ? "bg-primary/[0.07] text-primary"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        manage_accounts
                      </span>
                      تعديل الملف الشخصي
                    </Link>

                    <div className="mx-3 my-1 h-px bg-black/[0.06]" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px]
                                 font-bold text-red-500 transition-colors duration-150
                                 hover:bg-red-50/80"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[17px]">logout</span>
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* أزرار تسجيل الدخول والتسجيل */
          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-bold text-gray-500
                         transition-colors duration-200 hover:bg-gray-100/80 hover:text-gray-900"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white
                         shadow-md shadow-primary/20 transition-all duration-200
                         hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25
                         active:scale-95"
            >
              إنشاء حساب
            </Link>
          </div>
        )}
      </div>

      {/* ── اليمين: أزرار الموبايل ───────────────────────────── */}
      <div className="flex items-center gap-0.5 md:hidden">
        {isMounted && isLoggedIn && (
          <>
            {/* زر الدردشة */}
            <button
              onClick={() => setChatOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl
                         text-gray-400 transition-all duration-200
                         hover:bg-gray-100 hover:text-gray-700 active:scale-95"
              aria-label="الرسائل"
              type="button"
            >
              <span className="material-symbols-outlined text-[21px]">chat</span>
              {chatUnreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -left-0.5 flex h-[18px] min-w-[18px]
                             items-center justify-center rounded-full bg-red-500 px-1
                             text-[9px] font-black text-white shadow-sm"
                >
                  {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                </span>
              )}
            </button>

            <NotificationBell />
          </>
        )}

        {/* زر فتح/إغلاق القائمة */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="القائمة"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-600
                     transition-all duration-200 hover:bg-gray-100 hover:text-gray-900
                     active:scale-95"
          type="button"
        >
          <span
            className={`material-symbols-outlined text-[22px] transition-transform
                        duration-300 ${isMobileMenuOpen ? "rotate-90" : ""}`}
          >
            {isMobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* ── قائمة الموبايل المنسدلة ──────────────────────────── */}
      <div
        className={`absolute top-full left-0 right-0 border-b border-black/[0.06]
                    bg-white/95 backdrop-blur-xl transition-all duration-300
                    ease-out md:hidden
                    ${isMobileMenuOpen
                      ? "pointer-events-auto translate-y-0 opacity-100 shadow-xl shadow-black/[0.07]"
                      : "pointer-events-none -translate-y-2 opacity-0"
                    }`}
      >
        <div className="flex flex-col gap-0.5 px-3 py-3">

          {/* بطاقة المستخدم في الموبايل */}
          {isMounted && isLoggedIn && (
            <div
              className="mb-2 flex items-center gap-3 rounded-2xl
                         bg-gradient-to-l from-primary/[0.07] to-primary/[0.03] p-3"
            >
              <div className="relative shrink-0">
                <div
                  className="flex h-10 w-10 items-center justify-center overflow-hidden
                             rounded-full border border-primary/20
                             bg-gradient-to-br from-primary/20 to-primary/5"
                >
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={firstName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="material-symbols-outlined text-[22px] text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      account_circle
                    </span>
                  )}
                </div>
                <span
                  className="absolute -right-0.5 -bottom-0.5 rounded-full border
                             border-white bg-white px-0.5 text-xs shadow-sm"
                >
                  {userBadge}
                </span>
              </div>

              <div className="flex flex-col leading-none">
                <span className="text-sm font-black text-gray-900">{user?.name}</span>
                <span className="mt-0.5 text-xs font-semibold text-primary/80">
                  المستوى {userLevel}
                </span>
              </div>
            </div>
          )}

          {/* روابط التنقل الرئيسية */}
          {visibleLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                            font-bold transition-colors duration-150
                            ${isActive
                              ? "bg-primary/[0.08] text-primary"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
              >
                <span
                  className="material-symbols-outlined text-[19px]"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}

          {/* حالة التحميل */}
          {!isMounted ? (
            <div className="mt-2 h-12 animate-pulse rounded-xl bg-gray-100" />
          ) : isLoggedIn ? (
            <>
              <div className="my-1.5 h-px w-full bg-black/[0.06]" />

              {/* زر التبرع */}
              <Link
                href="/add-item"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-primary/[0.07] px-3 py-2.5
                           text-sm font-bold text-primary transition-colors duration-150
                           hover:bg-primary/[0.12]"
              >
                <span
                  className="material-symbols-outlined text-[19px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add_circle
                </span>
                تبرع بغرض الآن
              </Link>

              <Link
                href="/profile/edit"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                            font-bold transition-colors duration-150
                            ${pathname === "/profile/edit"
                              ? "bg-primary/[0.08] text-primary"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
              >
                <span className="material-symbols-outlined text-[19px]">
                  manage_accounts
                </span>
                تعديل الملف الشخصي
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                            font-bold transition-colors duration-150
                            ${pathname === "/dashboard"
                              ? "bg-primary/[0.08] text-primary"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
              >
                <span
                  className="material-symbols-outlined text-[19px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  dashboard
                </span>
                لوحة التحكم
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                              font-bold transition-colors duration-150
                              ${pathname.startsWith("/admin")
                                ? "bg-red-100 text-red-600"
                                : "text-red-500 hover:bg-red-50"
                              }`}
                >
                  <span className="material-symbols-outlined text-[19px]">
                    admin_panel_settings
                  </span>
                  لوحة الإدارة
                </Link>
              )}

              <div className="my-1.5 h-px w-full bg-black/[0.06]" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                           font-bold text-red-500 transition-colors duration-150
                           hover:bg-red-50/80"
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">logout</span>
                تسجيل الخروج
              </button>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-2 pb-1">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl border border-primary/25 py-3 text-center text-sm
                           font-bold text-primary transition-colors duration-150
                           hover:bg-primary/[0.05]"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl bg-primary py-3 text-center text-sm font-bold
                           text-white shadow-md shadow-primary/20"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ConversationsDrawer — Lazy Mount */}
      {isReadyForUserData && chatOpen && (
        <ConversationsDrawer
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          onUnreadCountChange={setServerChatUnreadCount}
        />
      )}
    </nav>
  );
}