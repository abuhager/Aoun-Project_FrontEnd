import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useNavbar() {
  const pathname = usePathname();
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    setIsMobileMenuOpen(false);
    await logout();
  }, [logout]);

  const firstName = user?.name?.split(" ")[0] ?? "حسابي";

  return {
    pathname,
    isLoggedIn: !isLoading && isLoggedIn,
    isLoading,
    firstName,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleLogout,
  };
}
