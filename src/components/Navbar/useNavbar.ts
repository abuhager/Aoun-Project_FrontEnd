// src/components/Navbar/useNavbar.ts
import { useState, useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAuth }     from "@/context/AuthContext";

const LOGO_ONLY_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function useNavbar() {
  const pathname = usePathname();
  const { user, isLoggedIn, isLoading, logout } = useAuth();

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [mobileMenu, setMobileMenu] = useState({ pathname, open: false });
  const [profileDropdown, setProfileDropdown] = useState({ pathname, open: false });
  const isMobileMenuOpen = mobileMenu.pathname === pathname && mobileMenu.open;
  const isProfileDropdownOpen = profileDropdown.pathname === pathname && profileDropdown.open;
  const setIsMobileMenuOpen = useCallback((open: boolean) => {
    setMobileMenu({ pathname, open });
  }, [pathname]);
  const setIsProfileDropdownOpen = useCallback((open: boolean) => {
    setProfileDropdown({ pathname, open });
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    await logout();
  }, [logout, setIsMobileMenuOpen, setIsProfileDropdownOpen]);

  const firstName      = user?.name?.split(" ")[0] ?? "حسابي";
  const userRole       = user?.role ?? null;
  const isLogoOnlyPage = LOGO_ONLY_PAGES.some((p) => pathname.startsWith(p));

  return {
    pathname,
    isLoggedIn: isMounted ? isLoggedIn : false,
    isLoading,
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
  };
}
