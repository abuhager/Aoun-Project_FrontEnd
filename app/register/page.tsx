'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      return setError('كلمات المرور غير متطابقة! 🛑');
    }

    try {
      setLoading(true);
       await axios.post('https://aoun-project-backend.onrender.com/api/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: "962" + formData.phone,
        password: formData.password,
      });

      setSuccess('تم إنشاء الحساب بنجاح! جاري تحويلك للتفعيل... ⏳');
      router.push(`/verify?email=${formData.email}`);

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || 'حدث خطأ أثناء إنشاء الحساب ❌');
      } else {
        setError('حدث خطأ غير متوقع ❌');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-background min-h-screen flex flex-col overflow-x-hidden">
      <main className="grow flex flex-col md:flex-row-reverse">
        
        {/* 🟢 القسم الأيسر: الصورة مع التعتيم والوضوح */}
        <section className="hidden md:flex md:w-1/2 relative overflow-hidden bg-primary items-center justify-center min-h-75 md:min-h-full">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/students-bg.jpg" 
              alt="University students smiling" 
              fill 
              className="object-cover" 
              priority 
            />
            {/* طبقة تعتيم Overlay سوداء لضمان وضوح النص الأبيض */}
            <div className="absolute inset-0 bg-black/50 z-10"></div>
          </div>

          <div className="relative z-20 p-6 md:p-12 max-w-lg w-full">
            {/* تأثير زجاجي Glassmorphism */}
            <div className="bg-white/10 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20">
              <div className="w-12 h-12 rounded-2xl bg-[#96f7e9]/20 flex items-center justify-center mb-6 border border-[#96f7e9]/30">
                <span className="material-symbols-outlined text-[#96f7e9] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                انضم إلى <br /> مجتمع <span className="text-[#96f7e9]">عون</span>
              </h2>
              
              <p className="text-white/90 text-base md:text-lg leading-relaxed mb-8">
                نحن نبني جسوراً من العطاء بين طلاب الجامعات والمجتمع. سجل اليوم لتكون جزءاً من التغيير الإيجابي.
              </p>
              
              <div className="flex items-center gap-4 text-white bg-white/10 p-4 rounded-2xl border border-white/10">
                <span className="material-symbols-outlined text-3xl md:text-4xl text-[#96f7e9]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <div className="flex flex-col">
                    <span className="font-bold text-lg">شارة الطالب الموثق</span>
                    <span className="text-xs text-white/70">استخدم إيميلك الجامعي للحصول عليها</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* القسم الأيمن: فورم التسجيل */}
        <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 lg:p-16 bg-surface">
          <div className="w-full max-w-md">
            
            <div className="mb-6 md:mb-8 text-right">
              <div className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-1 brand-font">عون</div>
              <h1 className="text-xl md:text-2xl font-bold text-on-background">إنشاء حساب جديد</h1>
              <p className="text-sm text-on-surface-variant mt-1">ابدأ رحلتك في العمل المجتمعي اليوم</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-xs md:text-sm text-center font-bold border border-red-200">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-xs md:text-sm text-center font-bold border border-green-200">{success}</div>}

            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
              
              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">الاسم الكامل</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">person</span>
                  <input name="name" value={formData.name} onChange={handleChange} required className="w-full pr-12 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm md:text-base" placeholder="أدخل اسمك الثلاثي" type="text" />
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">البريد الإلكتروني</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">mail</span>
                  <input name="email" value={formData.email} onChange={handleChange} required className="w-full pr-12 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-left text-sm md:text-base" dir="ltr" placeholder="example@university.edu" type="email" />
                </div>
              </div>

            <div className="space-y-1.5">
  <label className="text-xs font-bold text-gray-500 mr-2">رقم الهاتف (للتواصل)</label>
  <div className="relative group">
    {/* أيقونة الاتصال */}
    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl group-focus-within:text-primary transition-colors z-10">call</span>

    {/* مفتاح الأردن الثابت مع العلم */}
    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-[#edeeef] pointer-events-none select-none z-10">
      <span className="text-sm">🇯🇴</span>
      <span className="text-sm font-black text-on-surface-variant mt-0.5" dir="ltr">+962</span>
      <div className="w-px h-4 bg-gray-200 ml-1"></div>
    </div>

    {/* حقل الإدخال */}
    <input 
      name="phone" 
      value={formData.phone} 
      onChange={handleChange} 
      required 
      maxLength={9} // 9 أرقام بس (بدون الصفر)
      className="w-full pr-12 pl-[105px] py-3 md:py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-left text-sm md:text-base font-bold tracking-widest placeholder:tracking-normal placeholder:font-normal" 
      dir="ltr" 
      placeholder="790000000" 
      type="tel" 
    />
  </div>
</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-1 md:space-y-2">
                  <label className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">كلمة المرور</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">lock</span>
                    <input name="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full pr-12 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-left text-sm md:text-base" dir="ltr" placeholder="••••••••" type="password" />
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <label className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">تأكيد المرور</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">lock_reset</span>
                    <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} className="w-full pr-12 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-left text-sm md:text-base" dir="ltr" placeholder="••••••••" type="password" />
                  </div>
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full py-3.5 md:py-4 bg-primary text-on-primary rounded-full font-bold text-base md:text-lg shadow-lg hover:bg-primary/90 transition-all mt-2 disabled:opacity-70 active:scale-95">
                {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
              </button>

              <p className="text-center text-on-surface-variant text-xs md:text-sm mt-4 font-medium">
                لديك حساب بالفعل؟ 
                <Link href="/login" className="text-primary font-bold hover:underline mr-1">تسجيل الدخول</Link>
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}