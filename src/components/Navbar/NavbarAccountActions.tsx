"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { NavbarController } from "./useNavbarController";

const NotificationBell = dynamic(() => import("@/components/NotificationBell"), {
  ssr: false,
  loading: () => (
    <span className="block h-9 w-9 animate-pulse rounded-xl bg-surface-container-high" />
  ),
});

type NavbarAccountActionsProps = Pick<
  NavbarController,
  | "isMounted"
  | "isLoggedIn"
  | "isAdmin"
  | "pathname"
  | "openChatInbox"
  | "chatUnreadCount"
  | "dropdownRef"
  | "profileButtonRef"
  | "isProfileDropdownOpen"
  | "setIsProfileDropdownOpen"
  | "profileMenuId"
  | "user"
  | "firstName"
  | "userBadge"
  | "userLevel"
  | "handleLogout"
>;

export function NavbarAccountActions(props: NavbarAccountActionsProps) {
  const {
    isMounted,
    isLoggedIn,
    isAdmin,
    pathname,
    openChatInbox,
    chatUnreadCount,
    dropdownRef,
    profileButtonRef,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
    profileMenuId,
    user,
    firstName,
    userBadge,
    userLevel,
    handleLogout,
  } = props;

  if (!isMounted) {
    return (
      <div className="hidden h-10 w-28 animate-pulse rounded-2xl bg-surface-container-high lg:block" />
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="hidden items-center gap-1.5 lg:flex">
        <Link
          href="/login"
          className="rounded-xl px-3 py-2 text-sm font-bold text-[#6f6a63] transition-colors duration-200 hover:bg-[#f5f2ec] hover:text-[#191919]"
        >
          تسجيل الدخول
        </Link>
        <Link
          href="/register"
          className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-[0_8px_18px_rgba(1,105,111,0.18)] transition-all duration-200 hover:bg-primary/95 hover:shadow-[0_12px_24px_rgba(1,105,111,0.24)] active:scale-[0.98]"
        >
          إنشاء حساب
        </Link>
      </div>
    );
  }

  return (
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
          <span className="material-symbols-outlined text-[17px]">
            admin_panel_settings
          </span>
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
                <Image
                  src={user.avatar}
                  alt={firstName}
                  fill
                  sizes="32px"
                  className="object-cover"
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
            <span className="absolute -bottom-1 -left-1 rounded-full border border-white bg-white px-0.5 text-[9px] leading-none shadow-sm">
              {userBadge}
            </span>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="max-w-[74px] truncate text-[12px] font-black text-[#191919]">
              {firstName}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold text-primary/80">
              المستوى {userLevel}
            </span>
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
          <div
            id={profileMenuId}
            aria-label="خيارات الحساب"
            className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
          >
            <div className="border-b border-black/[0.05] bg-[linear-gradient(180deg,rgba(1,105,111,0.06),rgba(1,105,111,0.02))] px-4 py-3">
              <p className="truncate text-[13px] font-black text-[#191919]">
                {user?.name}
              </p>
              <p className="mt-1 truncate text-[11px] text-[#8a837b]">
                {user?.email}
              </p>
            </div>
            <div className="p-1.5">
              <AccountLink
                href="/dashboard"
                icon="dashboard"
                label="لوحة التحكم"
                active={pathname === "/dashboard"}
                filled
              />
              <AccountLink
                href="/profile/edit"
                icon="manage_accounts"
                label="تعديل الملف الشخصي"
                active={pathname === "/profile/edit"}
              />
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
  );
}

function AccountLink({
  href,
  icon,
  label,
  active,
  filled = false,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  filled?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-200 ${
        active
          ? "bg-primary/[0.07] text-primary"
          : "text-[#635d56] hover:bg-[#f7f4ee] hover:text-[#171717]"
      }`}
    >
      <span
        className="material-symbols-outlined text-[17px]"
        style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
