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
  const userBadge = user?.gamification?.badge ?? "🌱";

  const chatUnreadCount = isReadyForUserData ? serverChatUnreadCount : 0;

  const visibleLinks = useMemo(() => {
    return NAV_LINKS.filter((link) => {
      if (!link.authRequired) return true;
      return isReadyForUserData;
    });
  }, [isReadyForUserData]);

  const fetchUnreadCount = useCallback(async () => {
    const response = await axiosInstance.get<ConversationUnreadItem[]>("/api/conversations");
    const data = Array.isArray(response.data) ? response.data : [];
    return data.reduce((sum, conv) => sum + (conv.unread || 0), 0);
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
      .catch((err) => {
        console.error("fetch navbar unread count error", err);
        if (cancelled) return;
        setServerChatUnreadCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [isReadyForUserData, fetchUnreadCount]);

  if (isLogoOnlyPage) {
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-100 flex h-16 items-center justify-start border-b border-[#edeeef] bg-white/80 px-4 backdrop-blur-md md:h-20 md:px-8"
        dir="rtl"
      >
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
            <span className="material-symbols-outlined text-2xl text-white">
              volunteer_activism
            </span>
          </div>
          <span className="text-xl font-black tracking-tighter text-[#191c1d]">
            عـون
          </span>
        </Link>
      </nav>
    );
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-100 flex h-16 items-center justify-between border-b border-[#edeeef] bg-white/90 px-4 shadow-sm backdrop-blur-md md:h-20 md:px-8"
      dir="rtl"
    >
      <div className="flex items-center gap-6 md:gap-10">
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 transition-transform duration-300 group-hover:rotate-12 md:h-10 md:w-10">
            <span className="material-symbols-outlined text-xl text-white md:text-2xl">
              volunteer_activism
            </span>
          </div>
          <span className="text-lg font-black tracking-tighter text-[#191c1d] md:text-xl">
            عـون
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-primary/8 text-primary"
                    : "text-on-surface-variant hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-110"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {link.icon}
                </span>
                {link.label}
                {isActive && (
                  <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        {!isMounted ? (
          <div className="h-9 w-24 animate-pulse rounded-full bg-gray-100" />
        ) : isLoggedIn ? (
          <>
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  admin_panel_settings
                </span>
                الإدارة
              </Link>
            )}

            {pathname !== "/add-item" && (
              <Link
                href="/add-item"
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_circle
                </span>
                تبرع الآن
              </Link>
            )}

            <button
              onClick={() => setChatOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
              aria-label="الرسائل"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">chat</span>

              {chatUnreadCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm">
                  {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                </span>
              )}
            </button>

            <NotificationBell />

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-200 ${
                  isProfileDropdownOpen || pathname === "/dashboard"
                    ? "bg-primary/8 ring-1 ring-primary/20"
                    : "hover:bg-gray-50"
                }`}
                type="button"
              >
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-linear-to-br from-primary/20 to-primary/5">
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
                  <span className="absolute -bottom-1 -left-1 rounded-full border border-gray-100 bg-white px-0.5 text-[10px] leading-none shadow-sm">
                    {userBadge}
                  </span>
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-[13px] leading-tight font-black text-[#191c1d]">
                    {firstName}
                  </span>
                  <span className="text-[10px] leading-tight font-bold text-primary">
                    المستوى {userLevel}
                  </span>
                </div>

                <span
                  className={`material-symbols-outlined text-[16px] text-gray-400 transition-transform duration-200 ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-[#edeeef] bg-white shadow-xl">
                  <div className="border-b border-[#edeeef] bg-linear-to-l from-primary/5 to-transparent px-4 py-3">
                    <p className="truncate text-xs font-black text-[#191c1d]">
                      {user?.name}
                    </p>
                    <p className="truncate text-[11px] text-gray-400">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1.5">
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition-colors ${
                        pathname === "/dashboard"
                          ? "bg-primary/5 text-primary"
                          : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        dashboard
                      </span>
                      لوحة التحكم
                    </Link>

                    <Link
                      href="/profile/edit"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition-colors ${
                        pathname === "/profile/edit"
                          ? "bg-primary/5 text-primary"
                          : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        manage_accounts
                      </span>
                      تعديل الملف الشخصي
                    </Link>

                    <div className="mx-3 my-1 h-px bg-[#edeeef]" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        logout
                      </span>
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
              className="rounded-xl px-3 py-2 text-sm font-bold text-on-surface-variant transition-colors hover:text-primary"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-95"
            >
              إنشاء حساب
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 md:hidden">
        {isMounted && isLoggedIn && (
          <>
            <button
              onClick={() => setChatOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
              aria-label="الرسائل"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">chat</span>

              {chatUnreadCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm">
                  {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                </span>
              )}
            </button>

            <NotificationBell />
          </>
        )}

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="القائمة"
          className="flex items-center justify-center rounded-xl p-1.5 text-[#191c1d] transition-colors hover:bg-gray-50 hover:text-primary"
          type="button"
        >
          <span className="material-symbols-outlined text-2xl">
            {isMobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      <div
        className={`absolute top-full left-0 right-0 overflow-hidden border-b border-[#edeeef] bg-white/95 shadow-xl backdrop-blur-md transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? "max-h-175 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-0.5 px-4 py-3">
          {isMounted && isLoggedIn && (
            <div className="mb-1 flex items-center gap-3 rounded-2xl bg-primary/5 p-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-linear-to-br from-primary/20 to-primary/5">
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={firstName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="material-symbols-outlined text-2xl text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      account_circle
                    </span>
                  )}
                </div>
                <span className="absolute -right-0.5 -bottom-0.5 rounded-full border border-gray-100 bg-white px-0.5 text-xs shadow-sm">
                  {userBadge}
                </span>
              </div>

              <div>
                <p className="text-sm font-black text-[#191c1d]">{user?.name}</p>
                <p className="text-xs font-bold text-primary">المستوى {userLevel}</p>
              </div>
            </div>
          )}

          {visibleLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl p-3 text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
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

          {!isMounted ? (
            <div className="mt-2 h-12 rounded-xl bg-gray-100 animate-pulse" />
          ) : isLoggedIn ? (
            <>
              <div className="my-1 h-px w-full bg-[#edeeef]" />

              <Link
                href="/add-item"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-primary/5 p-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add_circle
                </span>
                تبرع بغرض الآن
              </Link>

              <Link
                href="/profile/edit"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl p-3 text-sm font-bold transition-colors ${
                  pathname === "/profile/edit"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  manage_accounts
                </span>
                تعديل الملف الشخصي
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl p-3 text-sm font-bold transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
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
                  className={`flex items-center gap-3 rounded-xl p-3 text-sm font-bold transition-colors ${
                    pathname.startsWith("/admin")
                      ? "bg-red-100 text-red-600"
                      : "text-red-500 hover:bg-red-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    admin_panel_settings
                  </span>
                  لوحة الإدارة
                </Link>
              )}

              <div className="my-1 h-px w-full bg-[#edeeef]" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl p-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
                تسجيل الخروج
              </button>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl border border-primary/30 py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-primary/5"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white shadow-md"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          )}
        </div>
      </div>

      {isReadyForUserData && (
        <ConversationsDrawer
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          onUnreadCountChange={setServerChatUnreadCount}
        />
      )}
    </nav>
  );
}