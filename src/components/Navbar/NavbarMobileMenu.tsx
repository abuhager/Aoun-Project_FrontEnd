"use client";

import Image from "next/image";
import Link from "next/link";
import type { NavbarController } from "./useNavbarController";

type NavbarMobileMenuProps = Pick<
  NavbarController,
  | "isMobileMenuOpen"
  | "setIsMobileMenuOpen"
  | "mobileMenuId"
  | "mobileMenuPanelRef"
  | "isMounted"
  | "isLoggedIn"
  | "user"
  | "firstName"
  | "userBadge"
  | "userLevel"
  | "visibleLinks"
  | "isNavLinkActive"
  | "pathname"
  | "isAdmin"
  | "handleLogout"
>;

export function NavbarMobileMenu(props: NavbarMobileMenuProps) {
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    mobileMenuId,
    mobileMenuPanelRef,
    isMounted,
    isLoggedIn,
    user,
    firstName,
    userBadge,
    userLevel,
    visibleLinks,
    isNavLinkActive,
    pathname,
    isAdmin,
    handleLogout,
  } = props;

  if (!isMobileMenuOpen) return null;
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div id={mobileMenuId} className="lg:hidden">
      <button
        type="button"
        aria-label="إغلاق القائمة"
        onClick={closeMenu}
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
                    <span className="material-symbols-outlined text-[21px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
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
            {visibleLinks.map((link) => (
              <MobileLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                active={isNavLinkActive(link.href)}
                onClick={closeMenu}
              />
            ))}
          </div>

          {!isMounted ? (
            <div className="mt-3 h-12 animate-pulse rounded-xl bg-[#f2eee8]" />
          ) : isLoggedIn ? (
            <AuthenticatedMobileLinks
              pathname={pathname}
              isAdmin={isAdmin}
              closeMenu={closeMenu}
              handleLogout={handleLogout}
            />
          ) : (
            <div className="mt-3 flex flex-col gap-2 pb-1">
              <Link href="/login" onClick={closeMenu} className="rounded-xl border border-primary/25 py-3 text-center text-sm font-bold text-primary transition-colors duration-200 hover:bg-primary/[0.05]">
                تسجيل الدخول
              </Link>
              <Link href="/register" onClick={closeMenu} className="rounded-xl bg-primary py-3 text-center text-sm font-bold text-white shadow-[0_8px_18px_rgba(1,105,111,0.18)]">
                إنشاء حساب جديد
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthenticatedMobileLinks({
  pathname,
  isAdmin,
  closeMenu,
  handleLogout,
}: {
  pathname: string;
  isAdmin: boolean;
  closeMenu: () => void;
  handleLogout: () => void;
}) {
  return (
    <>
      <div className="my-3 h-px bg-black/[0.06]" />
      <MobileLink href="/add-item" icon="add_circle" label="تبرع بغرض الآن" active={false} onClick={closeMenu} emphasized filled />
      <MobileLink href="/dashboard" icon="dashboard" label="لوحة التحكم" active={pathname === "/dashboard"} onClick={closeMenu} filled />
      <MobileLink href="/profile/edit" icon="manage_accounts" label="تعديل الملف الشخصي" active={pathname === "/profile/edit"} onClick={closeMenu} />
      {isAdmin && (
        <MobileLink href="/admin" icon="admin_panel_settings" label="لوحة الإدارة" active={pathname.startsWith("/admin")} onClick={closeMenu} danger />
      )}
      <div className="my-3 h-px bg-black/[0.06]" />
      <button onClick={handleLogout} className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 transition-colors duration-200 hover:bg-red-50/80" type="button">
        <span className="material-symbols-outlined text-[19px]">logout</span>
        تسجيل الخروج
      </button>
    </>
  );
}

function MobileLink({
  href,
  icon,
  label,
  active,
  onClick,
  emphasized = false,
  danger = false,
  filled = false,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  emphasized?: boolean;
  danger?: boolean;
  filled?: boolean;
}) {
  const colorClass = danger
    ? active
      ? "bg-red-100 text-red-600"
      : "text-red-500 hover:bg-red-50"
    : emphasized
      ? "bg-primary/[0.07] text-primary hover:bg-primary/[0.12]"
      : active
        ? "bg-primary/[0.08] text-primary"
        : "text-[#635d56] hover:bg-[#f7f4ee] hover:text-[#171717]";

  return (
    <Link href={href} aria-current={active ? "page" : undefined} onClick={onClick} className={`mt-1 flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors duration-200 ${colorClass}`}>
      <span className="material-symbols-outlined text-[19px]" style={{ fontVariationSettings: filled || active ? "'FILL' 1" : "'FILL' 0" }}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
