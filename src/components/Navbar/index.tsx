"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import BrandMark from "@/components/ui/BrandMark";
import { useNavbarController } from "./useNavbarController";

const NotificationBell = dynamic(() => import("@/components/NotificationBell"), {
  ssr: false,
  loading: () => (
    <span className="block h-9 w-9 animate-pulse rounded-xl bg-surface-container-high" />
  ),
});

const ConversationsDrawer = dynamic(
  () => import("@/components/ConversationsDrawer"),
  { ssr: false }
);

export default function Navbar() {
  const {
    platformName,
    pathname,
    isLoggedIn,
    isMounted,
    firstName,
    user,
    isLogoOnlyPage,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
    handleLogout,
    dropdownRef,
    profileButtonRef,
    mobileMenuButtonRef,
    mobileMenuPanelRef,
    profileMenuId,
    mobileMenuId,
    chatOpen,
    requestedConversationId,
    isReadyForUserData,
    isAdmin,
    userLevel,
    userBadge,
    chatUnreadCount,
    visibleLinks,
    isNavLinkActive,
    openChatInbox,
    closeChat,
    setServerChatUnreadCount,
  } = useNavbarController();

  if (isLogoOnlyPage) {
    return (
      <nav
        className="fixed inset-x-0 top-0 z-50 h-16 border-b border-black/[0.06] bg-white/92 shadow-[0_1px_0_rgba(23,33,31,0.02)] backdrop-blur-xl md:h-20"
        dir="rtl"
        aria-label="التنقل الرئيسي"
      >
        <div className="site-container flex h-full items-center">
          <Link
            href="/"
            aria-label={`العودة إلى الرئيسية — ${platformName}`}
            className="rounded-xl"
          >
            <BrandMark name={platformName} tagline="عطاء يصل لمن يحتاجه" />
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-white/92 shadow-[0_1px_0_rgba(23,33,31,0.02)] backdrop-blur-xl"
        dir="rtl"
        aria-label="التنقل الرئيسي"
      >
        <div className="site-container flex h-16 items-center justify-between lg:h-[68px]">
          <div className="flex shrink-0 items-center">
            <Link
              href="/"
              aria-label={`العودة إلى الرئيسية — ${platformName}`}
              className="rounded-xl"
            >
              <BrandMark name={platformName} compact />
            </Link>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-center px-5 lg:flex">
            <div className="flex items-center gap-1.5">
              {visibleLinks.map((link) => {
                const isActive = isNavLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-primary-soft text-primary-container"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
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

          <div className="flex shrink-0 items-center gap-1">
            {!isMounted ? (
              <div className="hidden h-10 w-28 animate-pulse rounded-2xl bg-surface-container-high lg:block" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-1 lg:rounded-[16px] lg:border lg:border-black/[0.06] lg:bg-surface-container-lowest lg:p-1 lg:shadow-sm">
                {isAdmin && (
                  <Link
                    href="/admin"
                    aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                    className={`hidden h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-black transition-all duration-300 lg:inline-flex ${
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
                    className="group hidden h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-black text-white shadow-[0_8px_18px_rgba(1,105,111,0.18)] transition-all duration-300 hover:bg-primary/95 hover:shadow-[0_12px_24px_rgba(1,105,111,0.24)] active:scale-[0.98] lg:inline-flex"
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
                  onClick={openChatInbox}
                  className="touch-target relative flex h-10 w-10 items-center justify-center rounded-xl text-[#77716a] transition-all duration-300 hover:bg-[#f5f2ec] hover:text-[#181818] lg:h-9 lg:w-9 lg:hover:bg-white"
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl lg:h-9 lg:w-9">
                  <NotificationBell />
                </div>
                <div className="relative hidden lg:block" ref={dropdownRef}>
                  <button
                    ref={profileButtonRef}
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`flex items-center gap-2 rounded-full px-2 py-1.5 transition-all duration-300 ${
                      isProfileDropdownOpen || pathname === "/dashboard"
                        ? "bg-[#eef6f5] ring-1 ring-primary/10"
                        : "hover:bg-white"
                    }`}
                    type="button"
                    aria-label="قائمة الحساب"
                    aria-haspopup="true"
                    aria-expanded={isProfileDropdownOpen}
                    aria-controls={profileMenuId}
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
                    <div id={profileMenuId} aria-label="خيارات الحساب" className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
                      <div className="border-b border-black/[0.05] bg-[linear-gradient(180deg,rgba(1,105,111,0.06),rgba(1,105,111,0.02))] px-4 py-3">
                        <p className="truncate text-[13px] font-black text-[#191919]">{user?.name}</p>
                        <p className="mt-1 truncate text-[11px] text-[#8a837b]">{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/dashboard"
                          aria-current={pathname === "/dashboard" ? "page" : undefined}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-200 ${
                            pathname === "/dashboard" ? "bg-primary/[0.07] text-primary" : "text-[#635d56] hover:bg-[#f7f4ee] hover:text-[#171717]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                          لوحة التحكم
                        </Link>
                        <Link
                          href="/profile/edit"
                          aria-current={pathname === "/profile/edit" ? "page" : undefined}
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
            ) : (
              <div className="hidden items-center gap-1.5 lg:flex">
                <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-bold text-[#6f6a63] transition-colors duration-200 hover:bg-[#f5f2ec] hover:text-[#191919]">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-[0_8px_18px_rgba(1,105,111,0.18)] transition-all duration-200 hover:bg-primary/95 hover:shadow-[0_12px_24px_rgba(1,105,111,0.24)] active:scale-[0.98]">
                  إنشاء حساب
                </Link>
              </div>
            )}
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls={mobileMenuId}
              aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              className={`touch-target flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 lg:hidden ${
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

        {isMobileMenuOpen && (
          <div id={mobileMenuId} className="lg:hidden">
            <button
              type="button"
              aria-label="إغلاق القائمة"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 top-16 bg-black/20 backdrop-blur-[2px]"
            />
            <div
              ref={mobileMenuPanelRef}
              aria-label="قائمة التنقل على الهاتف"
              className="absolute left-0 right-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-black/[0.05] bg-white/95 shadow-[0_18px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            >
              <div className="safe-area-bottom px-3 py-3">
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
                      aria-current={isActive ? "page" : undefined}
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
                    aria-current={pathname === "/dashboard" ? "page" : undefined}
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
                    aria-current={pathname === "/profile/edit" ? "page" : undefined}
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
                      aria-current={pathname.startsWith("/admin") ? "page" : undefined}
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
        )}

        {isReadyForUserData && chatOpen && (
          <ConversationsDrawer
            isOpen={chatOpen}
            initialConversationId={requestedConversationId}
            onClose={closeChat}
            onUnreadCountChange={setServerChatUnreadCount}
          />
        )}
      </nav>
    </>
  );
}
