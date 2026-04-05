'use client';
import Cookies from 'js-cookie';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const searchParams = useSearchParams();
const expiredMsg   = searchParams.get("msg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      
      // 🟢 التعديل للعمل محلياً (أسرع بمليون مرة)
const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
  email: formData.email,
  password: formData.password,
});

      // 🟢 التعديل الاحترافي: حفظ التوكن في مكانين
      // 1. في localStorage للتعامل مع الطلبات من جهة الـ Client
      localStorage.setItem('token', res.data.token); 
      
      // 2. في Cookies لكي يتمكن الـ Middleware من قراءته وحماية الروابط
      // expires: 7 تعني أن التوكن سيبقى فعالاً لمدة 7 أيام
      Cookies.set('token', res.data.token, { expires: 7, secure: true, sameSite: 'strict' });

      router.push('/browse'); // النقل للصفحة الرئيسية بعد النجاح

    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.needsVerification) {
          setError('حسابك غير مفعل! جاري تحويلك لصفحة التفعيل... ⏳');
          setTimeout(() => {
            router.push(`/verify?email=${formData.email}`);
          }, 2000);
        } else {
          setError(err.response?.data?.msg || 'البريد الإلكتروني أو كلمة المرور غير صحيحة ❌');
        }
      } else {
        setError('حدث خطأ غير متوقع ❌');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className=" grow flex flex-row-reverse overflow-hidden min-h-screen bg-background" dir="rtl">
      {/* القسم الأيمن: نموذج تسجيل الدخول */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-surface z-10 relative">
        <div className="w-full max-w-md space-y-10">
          
          <div className="flex flex-col items-start gap-2">
            <span className="text-3xl font-black text-primary tracking-tight">عون</span>
            <h1 className="text-4xl font-extrabold text-on-background leading-tight">مرحباً بك مجدداً</h1>
            <p className="text-on-surface-variant">سجل دخولك لتستمر في رحلة العطاء والمساعدة</p>
          </div>

          {/* عرض رسالة الخطأ هنا */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* البريد الإلكتروني */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant px-2">البريد الإلكتروني</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">
                    mail
                  </span>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pr-12 pl-6 py-4 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline outline-none text-left" 
                    dir="ltr" 
                    placeholder="name@example.com" 
                  />
                </div>
              </div>

              {/* كلمة المرور */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-sm font-bold text-on-surface-variant">كلمة المرور</label>
                  <a className="text-sm font-bold text-primary hover:text-primary-container transition-colors" href="/forgot-password">نسيت كلمة المرور؟</a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pr-12 pl-6 py-4 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline outline-none text-left" 
                    dir="ltr" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 px-8 bg-linear-to-br from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          

         

          <p className="text-center text-on-surface-variant">
            ليس لديك حساب؟{' '}
            <Link className="text-primary font-bold hover:underline underline-offset-4 decoration-primary/30" href="/register">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </section>

      {/* القسم الأيسر: الصورة والنص (يظهر فقط في الشاشات الكبيرة) */}
      <section className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-primary">
<Image 
    src="/Volunteer-Background.png" 
    alt="Volunteer Background"
    fill // يملأ المساحة المتاحة
    priority // ضروري لأنها خلفية في صفحة اللوجن (تظهر أولاً)
    sizes="(max-width: 1024px) 100vw, 50vw" // لأنها خلفية تأخذ عرض الشاشة بالكامل
    className="object-cover mix-blend-overlay opacity-60" 
  />          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
        </div>

        <div className="absolute bottom-16 right-16 left-16 glass-effect p-12 rounded-2xl border border-white/10 text-white shadow-2xl">
          <div className="space-y-4">
            {/* 🟢 الإصلاح الثاني: استخدام &quot; لعلامات الاقتباس داخل الـ JSX */}
            <h2 className="text-3xl font-bold leading-relaxed">
              &quot;نحن هنا لنكون عوناً لبعضنا البعض، خطوة واحدة يمكنها تغيير حياة الكثيرين.&quot;
            </h2>
            <div className="flex items-center gap-4 pt-6 border-t border-white/20 mt-6">
              <div className="flex -space-x-4 space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold border-2 border-primary z-10">+١٥٠</div>
              </div>
              <p className="text-sm font-medium text-white/90">انضم لأكثر من ١٥٠ متطوع ومتبرع اليوم</p>
            </div>
          </div>
        </div>
        
        <div className="absolute top-12 left-12 w-32 h-32 bg-secondary/40 rounded-full blur-3xl"></div>
      </section>
    </main>
  );
}