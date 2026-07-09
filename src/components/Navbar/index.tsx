"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavbar } from "./useNavbar";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useSocket } from "@/context/SocketContext"; // ← استيراد السوكت للاستماع اللحظي
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
  unreadCount: number; // 👈 تصحيح التسمية لتتطابق مع الـ Backend
}

export default function Navbar() {
  const { platformName } = useSiteConfig();
  const { socket } = useSocket(); // 👈 جلب كائن السوكت

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
      
      // 👈 تصحيح الحساب ليعتمد على unreadCount بدلاً من unread الميتة
      return data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    } catch {
      return 0;
    }
  }, []);

  // 1️⃣ تحديث العداد دورياً عند تحميل الصفحة وتغير حالة المستخدم
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
    return () => { cancelled = true; };
  }, [isReadyForUserData, fetchUnreadCount]);

  // 2️⃣ 🌟 الاستماع اللحظي لتحديث شارة الرسائل فوراً وبدون ريفريش
  useEffect(() => {
    if (!socket || !isReadyForUserData) return;

    const handleRefresh = () => {
      fetchUnreadCount().then((total) => setServerChatUnreadCount(total));
    };

    socket.on("conversation_updated", handleRefresh);
    socket.on("messages_read", handleRefresh);

    return () => {
      socket.off("conversation_updated", handleRefresh);
      socket.off("messages_read", handleRefresh);
    };
  }, [socket, isReadyForUserData, fetchUnreadCount]);

  // 3️⃣ 🌟 الاستماع لحدث الإشعارات المنبثقة ومنع ظهورها للمرسل نفسه
  useEffect(() => {
    if (!socket || !isReadyForUserData) return;

    const onNotificationNew = (payload: {
      type: string;
      conversationId: string;
      from: { _id: string; name: string };
      preview: string;
    }) => {
      // إذا كان المستخدم الحالي هو نفسه مرسل الرسالة، نبتلع الإشعار تماماً من شاشته
      if (payload.from?._id === user?._id) return;

      console.log(`🔔 إشعار منبثق جديد لـ ${firstName} من ${payload.from?.name}`);
      // هنا يمكنك إطلاق الـ Toast الخاص بك مثل: toast(payload.preview)
    };

    socket.on("notification_new", onNotificationNew);
    return () => {
      socket.off("notification_new", onNotificationNew);
    };
  }, [socket, isReadyForUserData, user?._id, firstName]);

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

  const isNavLinkActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (isLogoOnlyPage) {
    return (
      <nav
        className="fixed inset-x-0 top-0 z-50 h-16 border-b border-black/[0.05] bg-white/88 backdrop-blur-xl md:h-20"
        dir="rtl"
      >
        <div className="mx-auto flex h-full max-w-[1480px] items-center px-4 md:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_10px_22px_rgba(1,105,111,0.18)] transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_14px_28px_rgba(1,105,111,0.24)]">
              <span
                className="material-symbols-outlined text-[21px] text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                volunteer_activism
              </span>
            </div>
            <div className="leading-none">
              <span className="text-xl font-black tracking-tight text-[#171717]">{platformName}</span>
              <p className="mt-1 text-[10px] font-semibold text-[#91897f]">
                عطاء يصل لمن يحتاجه
              </p>
            </div>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.05] bg-white/88 backdrop-blur-xl"
        dir="rtl"
      >
        <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-3 md:h-[66px] md:px-6">
          <div className="flex shrink-0 items-center">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-[0_8px_20px_rgba(1,105,111,0.18)] transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_12px_24px_rgba(1,105,111,0.24)] md:h-10 md:w-10">
                <span
                  className="material-symbols-outlined text-[20px] text-white md:text-[21px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  volunteer_activism
                </span>
              </div>
              <div className="hidden sm:block leading-none">
                <span className="text-lg font-black tracking-tight text-[#171717] md:text-xl">
                  {platformName}
                </span>
                <p className="mt-1 text-[10px] font-semibold text-[#91897f]">
                  عطاء أسهل وأكثر ثقة
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-center px-6 md:flex">
            <div className="flex items-center gap-1.5">
              {visibleLinks.map((link) => {
                const isActive = isNavLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-[#f2f7f6] text-primary"
                        : "text-[#6f6a63] hover:bg-[#f7f4ee] hover:text-[#191919]"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[17px] transition-transform duration-300 group-hover:scale-110"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {link.icon}
                    </span>
                    <span className="whitespace-nowrap">{link.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-[2px] right-1/2 h-1 w-1 translate-x-1/2 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {!isMounted ? (
              <div className="h-10 w-28 animate-pulse rounded-2xl bg-[#f2eee8]" />
            ) : isLoggedIn ? (
              <>
                <div className="flex items-center gap-1 rounded-[18px] border border-black/[0.05] bg-[#fbfaf8] p-1 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-black transition-all duration-300 ${
                        pathname.startsWith("/admin")
                          ? "bg-red-500 text-white shadow-sm"
                          : "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">admin_panel_settings</span>
                      الإدارة
                    </Link>
                  )}
                  {pathname !== "/add-item" && (
                    <Link
                      href="/add-item"
                      className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-black text-white shadow-[0_8px_18px_rgba(1,105,111,0.18)] transition-all duration-300 hover:bg-primary/95 hover:shadow-[0_12px_24px_rgba(1,105,111,0.24)] active:scale-[0.98]"
                    >
                      <span
                        className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:rotate-90"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        add_circle
                      </span>
                      تبرع الآن
                    </Link>
                  )}
                  <button
                    onClick={() => setChatOpen(true)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[#77716a] transition-all duration-300 hover:bg-white hover:text-[#181818]"
                    aria-label="الرسائل"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    {chatUnreadCount > 0 && (
                      <span className="absolute -left-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-sm">
                        {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                      </span>
                    )}
                  </button>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl">
                    <NotificationBell />
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className={`flex items-center gap-2 rounded-full px-2 py-1.5 transition-all duration-300 ${
                        isProfileDropdownOpen || pathname === "/dashboard"
                          ? "bg-[#eef6f5] ring-1 ring-primary/10"
                          : "hover:bg-white"
                      }`}
                      type="button"
                    >
                      <div className="relative shrink-0">
                        <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/10">
                          {user?.avatar ? (
                            <Image src={user.avatar} alt={firstName} fill sizes="32px" className="object-cover" />
                          ) : (
                            <span
                              className="material-symbols-outlined text-[18px] text-primary"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              account_circle
                            </span>
                          )}
                        </div>
                        <span className="absolute -bottom-1 -left-1 rounded-full border border-white bg-white px-0.5 text-[9px] leading-none shadow-sm">
                          {userBadge}
                        </span>
                      </div>
                      <div className="flex flex-col items-start leading-none">
                        <span className="max-w-[74px] truncate text-[12px] font-black text-[#191919]">{firstName}</span>
                        <span className="mt-0.5 text-[10px] font-semibold text-primary/80">المستوى {userLevel}</span>
                      </div>
                      <span
                        className={`material-symbols-outlined text-[15px] text-[#b4aea5] transition-transform duration-300 ${
                          isProfileDropdownOpen ? "-rotate-180" : ""
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {isProfileDropdownOpen && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
                        <div className="border-b border-black/[0.05] bg-[linear-gradient(180deg,rgba(1,105,111,0.06),rgba(1,105,111,0.02))] px-4 py-3">
                          <p className="truncate text-[13px] font-black text-[#191919]">{user?.name}</p>
                          <p className="mt-1 truncate text-[11px] text-[#8a837b]">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            href="/dashboard"
                            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-200 ${
                              pathname === "/dashboard" ? "bg-primary/[0.07] text-primary" : "text-[#635d56] hover:bg-[#f7f4ee] hover:text-[#171717]"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                            لوحة التحكم
                          </Link>
                          <Link
                            href="/profile/edit"
                            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-200 ${
                              pathname === "/profile/edit" ? "bg-primary/[0.07] text-primary" : "text-[#635d56] hover:bg-[#f7f4ee] hover:text-[#171717]"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[17px]">manage_accounts</span>
                            تعديل الملف الشخصي
                          </Link>
                          <div className="mx-2 my-1.5 h-px bg-black/[0.06]" />
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-red-500 transition-all duration-200 hover:bg-red-50/80"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[17px]">logout</span>
                            تسجيل الخروج
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-bold text-[#6f6a63] transition-colors duration-200 hover:bg-[#f5f2ec] hover:text-[#191919]">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-[0_8px_18px_rgba(1,105,111,0.18)] transition-all duration-200 hover:bg-primary/95 hover:shadow-[0_12px_24px_rgba(1,105,111,0.24)] active:scale-[0.98]">
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
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#77716a] transition-all duration-300 hover:bg-[#f5f2ec] hover:text-[#181818]"
                  aria-label="الرسائل"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  {chatUnreadCount > 0 && (
                    <span className="absolute -left-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-sm">
                      {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                    </span>
                  )}
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl">
                  <NotificationBell />
                </div>
              </>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="القائمة"
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                isMobileMenuOpen ? "bg-primary/[0.08] text-primary" : "text-[#6b665f] hover:bg-[#f5f2ec] hover:text-[#191919]"
              }`}
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${isMobileMenuOpen ? "rotate-90" : ""}`}
              >
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        <div className={`md:hidden ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className={`fixed inset-0 top-16 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
              isMobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className={`absolute left-0 right-0 top-full border-b border-black/[0.05] bg-white/95 backdrop-blur-xl transition-all duration-300 ${
              isMobileMenuOpen
                ? "translate-y-0 opacity-100 shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <div className="px-3 py-3">
              {isMounted && isLoggedIn && (
                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,rgba(1,105,111,0.08),rgba(1,105,111,0.03))] p-3">
                  <div className="relative shrink-0">
                    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/10">
                      {user?.avatar ? (
                        <Image src={user.avatar} alt={firstName} fill sizes="40px" className="object-cover" />
                      ) : (
                        <span
                          className="material-symbols-outlined text-[21px] text-primary"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          account_circle
                        </span>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -left-1 rounded-full border border-white bg-white px-0.5 text-[10px] shadow-sm">
                      {userBadge}
                    </span>
                  </div>
                  <div className="leading-none">
                    <span className="block text-sm font-black text-[#191919]">{user?.name}</span>
                    <span className="mt-1 block text-xs font-semibold text-primary/80">المستوى {userLevel}</span>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                {visibleLinks.map((link) => {
                  const isActive = isNavLinkActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors duration-200 ${
                        isActive ? "bg-primary/[0.08] text-primary" : "text-[#635d56] hover:bg-[#f7f4ee] hover:text-[#171717]"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[19px]"
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              {!isMounted ? (
                <div className="mt-3 h-12 animate-pulse rounded-xl bg-[#f2eee8]" />
              ) : isLoggedIn ? (
                <>
                  <div className="my-3 h-px bg-black/[0.06]" />
                  <Link
                    href="/add-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex min-h-[44px] items-center gap-3 rounded-xl bg-primary/[0.07] px-3 py-2.5 text-sm font-bold text-primary transition-colors duration-200 hover:bg-primary/[0.12]"
                  >
                    <span className="material-symbols-outlined text-[19px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                    تبرع بغرض الآن
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`mt-1 flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors duration-200 ${
                      pathname === "/dashboard" ? "bg-primary/[0.08] text-primary" : "text-[#635d56] hover:bg-[#f7f4ee] hover:text-[#171717]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[19px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    لوحة التحكم
                  </Link>
                  <Link
                    href="/profile/edit"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`mt-1 flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors duration-200 ${
                      pathname === "/profile/edit" ? "bg-primary/[0.08] text-primary" : "text-[#635d56] hover:bg-[#f7f4ee] hover:text-[#171717]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[19px]">manage_accounts</span>
                    تعديل الملف الشخصي
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`mt-1 flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors duration-200 ${
                        pathname.startsWith("/admin") ? "bg-red-100 text-red-600" : "text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[19px]">admin_panel_settings</span>
                      لوحة الإدارة
                    </Link>
                  )}
                  <div className="my-3 h-px bg-black/[0.06]" />
                  <button
                    onClick={handleLogout}
                    className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 transition-colors duration-200 hover:bg-red-50/80"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[19px]">logout</span>
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <div className="mt-3 flex flex-col gap-2 pb-1">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl border border-primary/25 py-3 text-center text-sm font-bold text-primary transition-colors duration-200 hover:bg-primary/[0.05]"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl bg-primary py-3 text-center text-sm font-bold text-white shadow-[0_8px_18px_rgba(1,105,111,0.18)]"
                  >
                    إنشاء حساب جديد
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {isReadyForUserData && chatOpen && (
          <ConversationsDrawer
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            onUnreadCountChange={setServerChatUnreadCount}
          />
        )}
      </nav>
    </>
  );
}