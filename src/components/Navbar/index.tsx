"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import BrandMark from "@/components/ui/BrandMark";
import { NavbarAccountActions } from "./NavbarAccountActions";
import { NavbarDesktopLinks } from "./NavbarDesktopLinks";
import { NavbarMobileMenu } from "./NavbarMobileMenu";
import { useNavbarController } from "./useNavbarController";

const ConversationsDrawer = dynamic(
  () => import("@/components/ConversationsDrawer"),
  { ssr: false }
);

export default function Navbar() {
  const {
    platformName,
    isLogoOnlyPage,
    visibleLinks,
    isNavLinkActive,
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
    mobileMenuButtonRef,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    mobileMenuId,
    mobileMenuPanelRef,
    isReadyForUserData,
    chatOpen,
    requestedConversationId,
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
          <Link href="/" aria-label={`العودة إلى الرئيسية — ${platformName}`} className="rounded-xl">
            <BrandMark name={platformName} tagline="عطاء يصل لمن يحتاجه" />
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-white/92 shadow-[0_1px_0_rgba(23,33,31,0.02)] backdrop-blur-xl"
      dir="rtl"
      aria-label="التنقل الرئيسي"
    >
      <div className="site-container flex h-16 items-center justify-between lg:h-[68px]">
        <div className="flex shrink-0 items-center">
          <Link href="/" aria-label={`العودة إلى الرئيسية — ${platformName}`} className="rounded-xl">
            <BrandMark name={platformName} compact />
          </Link>
        </div>

        <NavbarDesktopLinks
          visibleLinks={visibleLinks}
          isNavLinkActive={isNavLinkActive}
        />

        <div className="flex shrink-0 items-center gap-1">
          <NavbarAccountActions
            isMounted={isMounted}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            pathname={pathname}
            openChatInbox={openChatInbox}
            chatUnreadCount={chatUnreadCount}
            dropdownRef={dropdownRef}
            profileButtonRef={profileButtonRef}
            isProfileDropdownOpen={isProfileDropdownOpen}
            setIsProfileDropdownOpen={setIsProfileDropdownOpen}
            profileMenuId={profileMenuId}
            user={user}
            firstName={firstName}
            userBadge={userBadge}
            userLevel={userLevel}
            handleLogout={handleLogout}
          />
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls={mobileMenuId}
            aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            className={`touch-target flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 lg:hidden ${
              isMobileMenuOpen
                ? "bg-primary/[0.08] text-primary"
                : "text-[#6b665f] hover:bg-[#f5f2ec] hover:text-[#191919]"
            }`}
            type="button"
          >
            <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${isMobileMenuOpen ? "rotate-90" : ""}`}>
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      <NavbarMobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        mobileMenuId={mobileMenuId}
        mobileMenuPanelRef={mobileMenuPanelRef}
        isMounted={isMounted}
        isLoggedIn={isLoggedIn}
        user={user}
        firstName={firstName}
        userBadge={userBadge}
        userLevel={userLevel}
        visibleLinks={visibleLinks}
        isNavLinkActive={isNavLinkActive}
        pathname={pathname}
        isAdmin={isAdmin}
        handleLogout={handleLogout}
      />

      {isReadyForUserData && chatOpen && (
        <ConversationsDrawer
          isOpen={chatOpen}
          initialConversationId={requestedConversationId}
          onClose={closeChat}
          onUnreadCountChange={setServerChatUnreadCount}
        />
      )}
    </nav>
  );
}
