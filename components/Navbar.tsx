"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token) {
      setIsLoggedIn(true);
      try {
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data");
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    // 1. تنظيف الداتا
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // 2. تحديث الـ State فوراً (عشان الأزرار تختفي باللحظة)
    setIsLoggedIn(false);
    setUser(null);
    
    // 3. إعادة التوجيه مع ريفريش كامل لتنظيف الـ Memory
    window.location.href = "/login"; 
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-[#edeeef] px-4 md:px-8 h-16 md:h-20 flex items-center justify-between" dir="rtl">
      
      {/* 🏠 اللوجو + رابط التصفح الأساسي */}
      <div className="flex items-center gap-4 md:gap-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#006155] rounded-xl flex items-center justify-center shadow-lg shadow-[#006155]/20 group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined text-white text-2xl">volunteer_activism</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-[#191c1d]">عـون</span>
        </Link>

        {/* 🛒 رابط Browse (يظهر دايماً للمسجلين) */}
        {isLoggedIn && (
          <Link 
            href="/browse" 
            className={`flex items-center gap-1.5 text-sm font-black transition-all ${pathname === "/browse" ? "text-[#006155]" : "text-[#40493d] hover:text-[#006155]"}`}
          >
            <span className="material-symbols-outlined text-lg">explore</span>
            تصفح الأغراض
          </Link>
        )}
      </div>

      {/* 🛠️ الأزرار المختصرة */}
      <div className="flex items-center gap-3 md:gap-6">
        {isLoggedIn ? (
          <>
            {/* 1. زر تبرع الآن: الأخضر المميز */}
            {pathname !== "/add-item" && (
              <Link href="/add-item" className="bg-[#006155] text-white px-5 py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95">
                <span className="material-symbols-outlined text-sm">add</span>
                تبرع الآن
              </Link>
            )}

            {/* 2. زر البروفايل (الداشبورد): هو المدخل الوحيد للوحة التحكم */}
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-2 group px-2 py-1 rounded-xl transition-all ${pathname === "/dashboard" ? "bg-[#006155]/5 ring-1 ring-[#006155]/20" : "hover:bg-gray-50"}`}
              title="لوحة التحكم والبروفايل"
            >
              <div className="w-9 h-9 rounded-full bg-[#006155]/10 flex items-center justify-center overflow-hidden border border-[#006155]/10">
                 <span className="material-symbols-outlined text-[#006155] text-xl">account_circle</span>
              </div>
              <span className="hidden md:block text-xs font-black text-[#191c1d] group-hover:text-[#006155]">
                {user?.name?.split(' ')[0] || "حسابي"}
              </span>
            </Link>

            {/* 3. خروج */}
            <button onClick={handleLogout} className="text-gray-300 hover:text-red-600 transition-colors p-1" title="خروج">
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-[#006155] text-white px-6 py-2 rounded-full text-sm font-bold shadow-md">
            تسجيل الدخول
          </Link>
        )}
      </div>
    </nav>
  );
}