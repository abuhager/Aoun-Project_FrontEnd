// src/components/Navbar/useNavbar.ts
import { useState, useCallback, useLayoutEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAuth }     from "@/context/AuthContext";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    setIsMobileMenuOpen(false);
    await logout();
  }, [logout]);

  const firstName = user?.name?.split(" ")[0] ?? "حسابي";

  return {
    pathname,
    isLoggedIn: isMounted ? isLoggedIn : false,
    isLoading,
    isMounted,
    firstName,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleLogout,
  };
}