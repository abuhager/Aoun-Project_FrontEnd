"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface UserData {
  name: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter(); 
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Cookies.remove("token");
    setIsLoggedIn(false);
    setUser(null);
    setIsMobileMenuOpen(false); 
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-[#edeeef] px-4 md:px-8 h-16 md:h-20 flex items-center justify-between transition-all" dir="rtl">
      
      {/* 🟢 القسم الأيمن: اللوجو وروابط التصفح */}
      <div className="flex items-center gap-4 md:gap-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined text-white text-2xl">volunteer_activism</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-[#191c1d]">عـون</span>
        </Link>

        {/* 🟢 إضافة رابط "كيف نعمل؟" بجانب تصفح الأغراض */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/#how-it-works" 
            className="flex items-center gap-1.5 text-sm font-black text-on-surface-variant hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-lg">help</span>
            كيف نعمل؟
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
      </div>

      {/* 🟢 القسم الأيسر للشاشات الكبيرة */}
      <div className="hidden md:flex items-center gap-3 md:gap-6">
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
              <span className="text-xs font-black text-[#191c1d] group-hover:text-primary">
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

      {/* 🟢 زر القائمة للموبايل */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        className="md:hidden flex items-center justify-center text-[#191c1d] hover:text-primary transition-colors p-1"
      >
        <span className="material-symbols-outlined text-3xl">
          {isMobileMenuOpen ? "close" : "menu"}
        </span>
      </button>

      {/* 🟢 القائمة المنسدلة للموبايل */}
      <div className={`absolute top-full left-0 right-0 bg-white border-b border-[#edeeef] shadow-lg md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"}`}>
        {isLoggedIn ? (
          <div className="flex flex-col gap-2 px-6 font-bold text-sm">
            <Link href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl transition-colors text-gray-600 hover:bg-gray-50">
              <span className="material-symbols-outlined text-lg">help</span> كيف نعمل؟
            </Link>
            <Link href="/browse" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl transition-colors ${pathname === "/browse" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50"}`}>
              <span className="material-symbols-outlined text-lg">explore</span> تصفح الأغراض
            </Link>
            <Link href="/add-item" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl transition-colors ${pathname === "/add-item" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50"}`}>
              <span className="material-symbols-outlined text-lg">add_box</span> تبرع الآن
            </Link>
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2 p-3 rounded-xl transition-colors ${pathname === "/dashboard" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50"}`}>
              <span className="material-symbols-outlined text-lg">account_circle</span> حسابي ({user?.name?.split(' ')[0]})
            </Link>
            <div className="h-px w-full bg-gray-100 my-1"></div>
            <button onClick={handleLogout} className="flex items-center gap-2 p-3 rounded-xl text-red-500 hover:bg-red-50 text-right transition-colors">
              <span className="material-symbols-outlined text-lg">logout</span> تسجيل الخروج
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-6 font-bold">
            <Link href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl transition-colors text-gray-600 hover:bg-gray-50">
              <span className="material-symbols-outlined text-lg">help</span> كيف نعمل؟
            </Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary text-white px-4 py-3 rounded-xl text-center shadow-md mt-2">
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>

    </nav>
  );
}