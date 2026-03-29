import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/20 shadow-sm font-sans">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* 1. اللوجو */}
        <Link href="/" className="text-4xl font-black text-primary brand-font tracking-tight">
          عون
        </Link>

        {/* 2. الروابط بالوسط (مخفية على شاشات الموبايل الصغيرة) */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm text-on-surface-variant">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <Link href="/items" className="hover:text-primary transition-colors">تصفح التبرعات</Link>
          <Link href="#" className="hover:text-primary transition-colors">كيف تعمل</Link>
          <Link href="#" className="hover:text-primary transition-colors">طلاب موثوقون</Link>
        </div>

        {/* 3. أزرار الدخول والتسجيل */}
        <div className="flex gap-3 items-center">
          <Link href="/login" className="hidden sm:block px-5 py-2.5 text-primary font-bold hover:bg-primary/10 rounded-full transition-colors text-sm">
            تسجيل الدخول
          </Link>
          <Link href="/register" className="px-5 py-2.5 bg-primary text-on-primary rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 text-sm">
            ابـدأ التـبرع
          </Link>
        </div>

      </div>
    </nav>
  );
}