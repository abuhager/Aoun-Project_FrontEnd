'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    // 🟢 شلنا flex-row-reverse عشان ياخذ اتجاه الـ RTL الطبيعي
    <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-sm px-8 py-4 flex justify-between items-center" dir="rtl">
      
      <div className="flex items-center gap-4">
        {/* 🟢 وحدنا لون الشعار ليصير primary */}
        <Link href="/" className="text-3xl font-bold text-primary font-headline">
          عون
        </Link>
      </div>
      
      {/* 🟢 شلنا flex-row-reverse من الروابط */}
      <div className="hidden md:flex items-center gap-8 font-['Tajawal'] text-base font-medium">
        <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/browse">تصفح التبرعات</Link>
        <Link className="text-on-surface-variant hover:text-primary transition-colors" href="#">كيف نعمل</Link>
        <Link className="text-on-surface-variant hover:text-primary transition-colors" href="#">من نحن</Link>
        <Link className="text-on-surface-variant hover:text-primary transition-colors" href="#">طلاب موثوقون</Link>
      </div>
      
      {/* 🟢 شلنا flex-row-reverse من الأزرار */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <button className="px-6 py-2.5 rounded-full text-primary font-medium hover:bg-primary/10 transition-all active:scale-95 duration-200">
              لوحة التحكم
            </button>
            <button 
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-full bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all active:scale-95 duration-200"
            >
              تسجيل الخروج
            </button>
          </>
        ) : (
          <>
            {/* 🟢 حلينا مشكلة اللون الأبيض باستخدام التدرج المباشر */}
            <Link href="/register" className="px-6 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold transition-all active:scale-95 duration-200 shadow-md shadow-primary/20">
              إنشاء حساب
            </Link>
            <Link href="/login" className="px-6 py-2.5 rounded-full text-primary font-medium hover:bg-primary/10 transition-all active:scale-95 duration-200">
              تسجيل الدخول
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}