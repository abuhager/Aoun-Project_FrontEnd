'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
  // 1. تعريف المتغيرات اللي رح تمسك بيانات الفورم
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // متغيرات لحالة التحميل ورسائل النجاح والخطأ
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 2. دالة بتشتغل كل ما اليوزر يكتب حرف جوا أي مربع
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. دالة بتشتغل لما اليوزر يكبس "إنشاء حساب"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // نمنع الصفحة تعمل ريفريش
    setError('');
    setSuccess('');

    // فحص سريع: هل الباسوردات متطابقة؟
    if (formData.password !== formData.confirmPassword) {
      return setError('كلمات المرور غير متطابقة! 🛑');
    }

    try {
      setLoading(true); // تشغيل زر التحميل
      
      // 🟢 هون السحر: بنبعت البيانات للباك إند تبعك
      // (تأكد إنو الرابط والبورت بطابقوا مسار التسجيل عندك بالباك إند)
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // إذا نجح التسجيل
      setSuccess('تم إنشاء الحساب بنجاح! مبروك 🎉');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' }); // تفريغ الفورم
      
      // هون مستقبلاً بنقدر نحوله لصفحة تسجيل الدخول تلقائياً
      // window.location.href = '/login'; 

    }  catch (err) {
      // فحص ذكي: هل الإيرور جاي من Axios؟
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || 'حدث خطأ أثناء إنشاء الحساب ❌');
      } else {
        // إذا كان إيرور عادي (مش من السيرفر)
        setError('حدث خطأ غير متوقع ❌');
      }
    } finally {
      setLoading(false); // طفي زر التحميل
    }
  };

  return (
    <div className="bg-surface text-on-background min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col md:flex-row-reverse">
        
        {/* القسم الأيسر: الصورة (بدون تعديل) */}
        <section className="hidden md:flex md:w-1/2 relative overflow-hidden bg-primary items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image src="/students-bg.jpg" alt="University students smiling" fill className="object-cover mix-blend-overlay opacity-60" priority />
          </div>
          <div className="relative z-10 p-12 max-w-lg">
            <div className="glass-effect p-8 rounded-lg shadow-2xl border border-white/20">
              <h2 className="text-3xl font-bold text-primary mb-4 leading-tight">انضم إلى مجتمع عون</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
                نحن نبني جسوراً من العطاء بين طلاب الجامعات والمجتمع. سجل اليوم لتكون جزءاً من التغيير الإيجابي.
              </p>
              <div className="flex items-center gap-4 text-primary">
                <span className="material-symbols-outlined text-4xl">verified</span>
                <span className="font-bold text-xl">شارة الطالب الموثق بانتظارك</span>
              </div>
            </div>
          </div>
        </section>

        {/* القسم الأيمن: الفورم */}
        <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-surface">
          <div className="w-full max-w-md">
            
            <div className="mb-10 text-right">
              <div className="text-4xl font-black text-primary tracking-tight mb-2 brand-font">عون</div>
              <h1 className="text-2xl font-bold text-on-background">إنشاء حساب جديد</h1>
              <p className="text-on-surface-variant mt-2">ابدأ رحلتك في العمل المجتمعي اليوم</p>
            </div>

            {/* عرض رسالة الخطأ أو النجاح */}
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-bold">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center font-bold">{success}</div>}

            {/* ربطنا الفورم بـ handleSubmit */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-on-surface-variant mr-1">الاسم الكامل</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined">person</span>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="w-full pr-12 pl-4 py-4 bg-surface-container-highest rounded-md border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300" placeholder="أدخل اسمك الثلاثي" type="text" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-on-surface-variant mr-1">البريد الإلكتروني</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined">mail</span>
                  <input 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="w-full pr-12 pl-4 py-4 bg-surface-container-highest rounded-md border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 text-left" dir="ltr" placeholder="example@university.edu" type="email" 
                  />
                </div>
                <div className="flex items-center gap-2 mt-2 mr-1 px-3 py-2 bg-secondary/10 rounded-lg">
                  <span className="material-symbols-outlined text-secondary text-sm">info</span>
                  <p className="text-xs font-medium text-secondary">سجل ببريدك الجامعي (.edu) للحصول على شارة طالب موثق</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface-variant mr-1">كلمة المرور</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined">lock</span>
                    <input 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required minLength={6} 
                      className="w-full pr-12 pl-4 py-4 bg-surface-container-highest rounded-md border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 text-left" dir="ltr" placeholder="••••••••" type="password" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface-variant mr-1">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined">lock_reset</span>
                    <input 
                      name="confirmPassword" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      required minLength={6} 
                      className="w-full pr-12 pl-4 py-4 bg-surface-container-highest rounded-md border-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 text-left" dir="ltr" placeholder="••••••••" type="password" 
                    />
                  </div>
                </div>
              </div>

              {/* زر الإرسال مع حالة التحميل */}
              <button disabled={loading} type="submit" className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-bold text-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink mx-4 text-outline text-xs font-medium">أو التسجيل عبر</span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              <button type="button" className="w-full py-4 bg-surface-container-low text-on-surface font-semibold rounded-full border border-outline-variant/20 flex items-center justify-center gap-3 hover:bg-surface-container-highest transition-colors duration-300">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
                Google
              </button>

              <p className="text-center text-on-surface-variant text-sm mt-8 font-medium">
                لديك حساب بالفعل؟ 
                <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4 mr-1">تسجيل الدخول</Link>
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}