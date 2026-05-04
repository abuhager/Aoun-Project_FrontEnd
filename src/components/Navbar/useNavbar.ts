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
    // ✅ التحقق من الـ Cookie بدل localStorage للتوكن
    const token      = Cookies.get("token");
    const storedUser = localStorage.getItem("user"); // بيانات المستخدم العامة فقط

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

  useEffect(() => {
    syncAuth();
    setIsMobileMenuOpen(false);
  }, [pathname, syncAuth]);

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) syncAuth();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [syncAuth]);

  const handleLogout = () => {
    // ✅ حذف الـ Cookie + بيانات المستخدم
    Cookies.remove("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = "/login"; // full reload يضمن تنظيف الـ state
  };

  const firstName = user?.name?.split(" ")[0] ?? "حسابي";

  return {
    pathname, isLoggedIn, user, firstName,
    isMobileMenuOpen, setIsMobileMenuOpen,
    handleLogout,
  };
}