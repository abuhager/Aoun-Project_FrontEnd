// src/components/Navbar/useNavbar.ts
import { useState, useCallback, useLayoutEffect, useSyncExternalStore } from "react";
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

  const [isMobileMenuOpen, setIsMobileMenuOpen]         = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useLayoutEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    await logout();
  }, [logout]);

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