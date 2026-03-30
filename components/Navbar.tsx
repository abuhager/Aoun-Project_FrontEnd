"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie"; // 🟢 استيراد مكتبة الكوكيز

interface UserData {
  name: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter(); // 🟢 استخدام الـ router للتوجيه البرمجي
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  // مزامنة البيانات عند تغيير المسار
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const hasToken = !!token;

    if (hasToken !== isLoggedIn) {
      setIsLoggedIn(hasToken);
    }

    if (hasToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (user?.name !== parsedUser.name) {
          setUser(parsedUser);
        }
      } catch {
        console.error("Error parsing user data");
      }
    } else if (!hasToken && isLoggedIn) {
      setUser(null);
    }
  }, [pathname, isLoggedIn, user?.name]);

  // 🟢 دالة تسجيل الخروج المحدثة
  const handleLogout = () => {
    // 1. مسح التوكن والبيانات من localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. مسح التoكن من Cookies لتعطيل الـ Middleware فوراً
    Cookies.remove("token");

    // 3. تحديث الـ State المحلية
    setIsLoggedIn(false);
    setUser(null);

    // 4. التوجيه لصفحة تسجيل الدخول
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-100 bg-white/80 backdrop-blur-md border-b border-[#edeeef] px-4 md:px-8 h-16 md:h-20 flex items-center justify-between" dir="rtl">
      <div className="flex items-center gap-4 md:gap-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined text-white text-2xl">volunteer_activism</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-[#191c1d]">عـون</span>
        </Link>

        {isLoggedIn && (
          <Link 
            href="/browse" 
            className={`flex items-center gap-1.5 text-sm font-black transition-all ${pathname === "/browse" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
          >
            <span className="material-symbols-outlined text-lg">explore</span>
            تصفح الأغراض
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {isLoggedIn ? (
          <>
            {pathname !== "/add-item" && (
              <Link href="/add-item" className="bg-primary text-white px-5 py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95">
                <span className="material-symbols-outlined text-sm">add</span>
                تبرع الآن
              </Link>
            )}

            <Link 
              href="/dashboard" 
              className={`flex items-center gap-2 group px-2 py-1 rounded-xl transition-all ${pathname === "/dashboard" ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-gray-50"}`}
              title="لوحة التحكم والبروفايل"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/10">
                 <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
              </div>
              <span className="hidden md:block text-xs font-black text-[#191c1d] group-hover:text-primary">
                {user?.name?.split(' ')[0] || "حسابي"}
              </span>
            </Link>

            <button onClick={handleLogout} className="text-gray-300 hover:text-red-600 transition-colors p-1" title="خروج">
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-md">
            تسجيل الدخول
          </Link>
        )}
      </div>
    </nav>
  );
}