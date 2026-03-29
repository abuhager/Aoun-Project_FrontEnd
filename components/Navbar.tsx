'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // حالة القائمة في الموبايل

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-12 py-2 md:py-3 flex justify-between items-center transition-all" dir="rtl">
      
      {/* 1. Logo & Desktop Links */}
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl md:text-2xl font-black text-[#006155] hover:opacity-80 transition-opacity">
          عون
        </Link>
        
        {/* روابط الديسكتوب - صغرت الخط لـ text-xs/sm ليكون أرشق */}
        <div className="hidden md:flex items-center gap-6 text-[13px] font-bold text-[#40493d]">
          <Link className="hover:text-[#006155] transition-colors relative group" href="/browse">
            تصفح التبرعات
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#006155] transition-all group-hover:w-full"></span>
          </Link>
          <Link className="hover:text-[#006155] transition-colors relative group" href="/add-item">
            أضف تبرعاً
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#006155] transition-all group-hover:w-full"></span>
          </Link>
        </div>
      </div>

      {/* 2. Desktop Actions & Mobile Toggle */}
      <div className="flex items-center gap-2">
        
        {/* الأزرار في الديسكتوب */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="px-4 py-1.5 text-[13px] font-bold text-[#006155] hover:bg-[#006155]/5 rounded-full transition-all border border-[#006155]/20">
                لوحة التحكم
              </Link>
              <button onClick={handleLogout} className="px-4 py-1.5 text-[13px] bg-red-50 text-red-600 font-bold rounded-full hover:bg-red-100 transition-all">
                خروج
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-1.5 text-[13px] font-bold text-[#40493d] hover:text-[#006155]">
                دخول
              </Link>
              <Link href="/register" className="px-5 py-1.5 text-[13px] bg-[#006155] text-white font-bold rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>

        {/* زر الهامبرغر للموبايل */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[#006155] focus:outline-none"
        >
          <span className="material-symbols-outlined text-3xl">
            {isOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* 3. Mobile Menu (Drawer) */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-4 md:hidden shadow-xl animate-in slide-in-from-top duration-300">
          <Link onClick={() => setIsOpen(false)} className="text-lg font-bold text-[#40493d]" href="/browse">تصفح التبرعات</Link>
          <Link onClick={() => setIsOpen(false)} className="text-lg font-bold text-[#40493d]" href="/add-item">أضف تبرعاً</Link>
          <hr className="border-gray-50" />
          {isLoggedIn ? (
            <>
              <Link onClick={() => setIsOpen(false)} href="/dashboard" className="text-lg font-bold text-[#006155]">لوحة التحكم</Link>
              <button onClick={() => {handleLogout(); setIsOpen(false);}} className="text-right text-lg font-bold text-red-600">خروج</button>
            </>
          ) : (
            <>
              <Link onClick={() => setIsOpen(false)} href="/login" className="text-lg font-bold text-[#40493d]">دخول</Link>
              <Link onClick={() => setIsOpen(false)} href="/register" className="w-full py-3 bg-[#006155] text-white text-center font-bold rounded-xl">إنشاء حساب</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}