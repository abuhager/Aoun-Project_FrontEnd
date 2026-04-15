import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface UserData { name: string }

export function useNavbar() {
  const pathname = usePathname();
  const router   = useRouter();

  const [isLoggedIn,       setIsLoggedIn]       = useState(false);
  const [user,             setUser]             = useState<UserData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const syncAuth = useCallback(() => {
    const token      = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  // ─── مزامنة عند تغيير المسار + إغلاق القائمة ───
  useEffect(() => {
    syncAuth();
    setIsMobileMenuOpen(false);
  }, [pathname, syncAuth]);

  // ─── مزامنة عند الرجوع من bfcache ───
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) syncAuth();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [syncAuth]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Cookies.remove("token");
    setIsLoggedIn(false);
    setUser(null);
    router.push("/login");
  };

  const firstName = user?.name?.split(" ")[0] ?? "حسابي";

  return {
    pathname, isLoggedIn, user, firstName,
    isMobileMenuOpen, setIsMobileMenuOpen,
    handleLogout,
  };
}