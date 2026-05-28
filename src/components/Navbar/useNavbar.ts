// src/components/Navbar/useNavbar.ts
import { useState, useCallback, useLayoutEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAuth }     from "@/context/AuthContext";

// صفحات Auth — يظهر فيها Logo فقط
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

  // ✅ isMounted بدون useEffect
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ أغلق المنيو عند تغيير الصفحة
  useLayoutEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    setIsMobileMenuOpen(false);
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
    isLogoOnlyPage,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleLogout,
  };
}