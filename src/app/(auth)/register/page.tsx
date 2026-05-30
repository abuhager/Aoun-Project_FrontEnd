"use client";

import Image from "next/image";
import Link from "next/link";
import { useRedirectIfAuth } from "../hooks/useRedirectIfAuth";
import { useRegister } from "./hooks/useRegister";

export default function RegisterPage() {
  useRedirectIfAuth("/browse");
  const { formData, loading, error, success, handleChange, handleSubmit } = useRegister();

  const phoneValid   = formData.phone.length === 9;
  const phoneTouched = formData.phone.length > 0;
  const phoneError   = phoneTouched && !phoneValid;

  const phoneBorderClass = phoneError
    ? "border-red-300 focus:ring-2 focus:ring-red-200"
    : phoneValid
    ? "border-green-400 focus:ring-2 focus:ring-green-200"
    : "border-transparent focus:ring-2 focus:ring-primary/20 focus:bg-white";

  return (
    <div className="bg-surface text-on-background min-h-screen flex flex-col overflow-x-hidden">
      <main className="grow flex flex-col md:flex-row-reverse">

        {/* ─── القسم الأيسر: الصورة ─── */}
        <section className="hidden md:flex md:w-1/2 relative overflow-hidden bg-primary items-center justify-center min-h-75 md:min-h-full">
          <div className="absolute inset-0 z-0">
            <Image
              src="/students-bg.jpg"
              alt="University students smiling"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 z-10" />
          </div>

          <div className="relative z-20 p-6 md:p-12 max-w-lg w-full">
            <div className="bg-white/10 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20">
              <div className="w-12 h-12 rounded-2xl bg-[#96f7e9]/20 flex items-center justify-center mb-6 border border-[#96f7e9]/30">
                <span
                  className="material-symbols-outlined text-[#96f7e9] text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  hub
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                انضم إلى <br /> مجتمع <span className="text-[#96f7e9]">عون</span>
              </h2>

              <p className="text-white/90 text-base md:text-lg leading-relaxed mb-8">
                نحن نبني جسوراً من العطاء بين طلاب الجامعات والمجتمع. سجل اليوم لتكون جزءاً من التغيير الإيجابي.
              </p>

              <div className="flex items-center gap-4 text-white bg-white/10 p-4 rounded-2xl border border-white/10">
                <span
                  className="material-symbols-outlined text-3xl md:text-4xl text-[#96f7e9]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-lg">شارة الطالب الموثق</span>
                  <span className="text-xs text-white/70">استخدم إيميلك الجامعي للحصول عليها</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── القسم الأيمن: فورم التسجيل ─── */}
        <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 lg:p-16 bg-surface">
          <div className="w-full max-w-md">

            {/* العنوان */}
            <div className="mb-6 md:mb-8 text-right">
              <div className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-1 brand-font">عون</div>
              <h1 className="text-xl md:text-2xl font-bold text-on-background">إنشاء حساب جديد</h1>
              <p className="text-sm text-on-surface-variant mt-1">ابدأ رحلتك في العمل المجتمعي اليوم</p>
            </div>

            {/* رسائل الحالة */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-xs md:text-sm text-center font-bold border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-xs md:text-sm text-center font-bold border border-green-200">
                {success}
              </div>
            )}

            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit} dir="rtl">

              {/* الاسم */}
              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">الاسم الكامل</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">person</span>
                  <input
                    name="name" type="text" required
                    value={formData.name} onChange={handleChange}
                    placeholder="أدخل اسمك الثلاثي"
                    className="w-full pr-12 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm md:text-base"
                  />
                </div>
              </div>

              {/* البريد الإلكتروني */}
              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">البريد الإلكتروني</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">mail</span>
                  <input
                    name="email" type="email" required dir="ltr"
                    value={formData.email} onChange={handleChange}
                    placeholder="example@university.edu"
                    className="w-full pr-12 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-left text-sm md:text-base"
                  />
                </div>
              </div>

              {/* رقم الهاتف */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 mr-1">رقم الهاتف (للتواصل)</label>
                <div className="relative group">

                  {/* مفتاح الأردن — على اليمين */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5
                    bg-white px-3 py-1.5 rounded-lg shadow-sm border border-[#edeeef]
                    pointer-events-none select-none z-10">
                    <span className="text-sm">🇯🇴</span>
                    <span className="text-sm font-black text-on-surface-variant" dir="ltr">+962</span>
                    <div className="w-px h-4 bg-gray-200" />
                  </div>

                  <input
                    name="phone"
                    type="tel"
                    required
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={9}
                    value={formData.phone}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                      handleChange({
                        target: { name: "phone", value: digits },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    onKeyDown={e => {
                      const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                      if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
                    }}
                    placeholder="7XXXXXXXX"
                    className={`w-full pl-10 pr-[115px] py-3 md:py-4 bg-surface-container-highest rounded-xl
                      border-2 outline-none transition-all text-left text-sm md:text-base
                      font-bold tracking-[0.2em] placeholder:tracking-normal placeholder:font-normal
                      ${phoneBorderClass}`}
                  />

                  {/* عداد الأرقام — على اليسار */}
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black
                    transition-colors pointer-events-none
                    ${phoneValid ? "text-green-500" : phoneTouched ? "text-red-400" : "text-gray-300"}`}>
                    {formData.phone.length}/9
                  </span>
                </div>

                {/* رسالة الحالة تحت الحقل */}
                {phoneError && (
                  <p className="text-[11px] text-red-500 font-bold mr-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    الرقم يجب أن يكون 9 أرقام بالضبط
                  </p>
                )}
                {phoneValid && (
                  <p className="text-[11px] text-green-500 font-bold flex items-center gap-1 mr-1" dir="ltr">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    +962 {formData.phone}
                  </p>
                )}
              </div>

              {/* كلمة المرور + تأكيدها */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-1 md:space-y-2">
                  <label className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">كلمة المرور</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">lock</span>
                    <input
                      name="password" type="password" required dir="ltr" minLength={6}
                      value={formData.password} onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pr-12 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-left text-sm md:text-base"
                    />
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <label className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">تأكيد المرور</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">lock_reset</span>
                    <input
                      name="confirmPassword" type="password" required dir="ltr" minLength={6}
                      value={formData.confirmPassword} onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pr-12 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-left text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 md:py-4 bg-primary text-on-primary rounded-full font-bold text-base md:text-lg shadow-lg hover:bg-primary/90 transition-all mt-2 disabled:opacity-70 active:scale-95"
              >
                {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
              </button>

              <p className="text-center text-on-surface-variant text-xs md:text-sm mt-4 font-medium">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-primary font-bold hover:underline mr-1">
                  تسجيل الدخول
                </Link>
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}