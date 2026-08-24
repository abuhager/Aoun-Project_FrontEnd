"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRedirectIfAuth } from "../hooks/useRedirectIfAuth";
import { useRegister } from "./hooks/useRegister";
import { useSiteConfig } from "@/context/SiteConfigContext";

// [UX-10] ✅ Regex محسَّن — يتحقق من 77x أو 78x أو 79x بالضبط
const JORDAN_PHONE_REGEX = /^(77|78|79)\d{7}$/;

export default function RegisterPage() {
  useRedirectIfAuth("/browse");
  const { platformName } = useSiteConfig();
  const {
    formData,
    loading,
    error,
    success,
    emailAlreadyExists,
    handleChange,
    handleSubmit,
  } = useRegister();

  // [UX-01] ✅ حالتا إظهار/إخفاء لكلمتَي المرور
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // [UX-10] ✅ validation الهاتف المحسَّن
  const phoneTouched = formData.phone.length > 0;
  const phoneValid   = JORDAN_PHONE_REGEX.test(formData.phone);
  const phoneError   = phoneTouched && !phoneValid;

  const phoneBorderClass = phoneError
    ? "border-red-300 focus:ring-2 focus:ring-red-200"
    : phoneValid
    ? "border-green-400 focus:ring-2 focus:ring-green-200"
    : "border-transparent focus:ring-2 focus:ring-primary/20 focus:bg-white";

  return (
    <div className="bg-surface text-on-background min-h-dvh flex flex-col overflow-x-hidden">
      <div className="grow flex flex-col md:flex-row-reverse">

        {/* ─── القسم الأيسر: الصورة (decorative) ─── */}
        <section
          className="hidden md:flex md:w-1/2 relative overflow-hidden bg-primary items-center justify-center min-h-75 md:min-h-full"
          aria-hidden="true"
        >
          <div className="absolute inset-0 z-0">
            <Image src="/students-bg.jpg" alt="" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-black/50 z-10" />
          </div>
          <div className="relative z-20 p-6 md:p-12 max-w-lg w-full">
            <div className="bg-white/10 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20">
              <div className="w-12 h-12 rounded-2xl bg-[#96f7e9]/20 flex items-center justify-center mb-6 border border-[#96f7e9]/30">
                <span aria-hidden="true" className="material-symbols-outlined text-[#96f7e9] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                انضم إلى <br /> مجتمع <span className="text-[#96f7e9]">{platformName}</span>
              </h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed mb-8">
                نحن نبني جسوراً من العطاء بين طلاب الجامعات والمجتمع. سجل اليوم لتكون جزءاً من التغيير الإيجابي.
              </p>
              <div className="flex items-center gap-4 text-white bg-white/10 p-4 rounded-2xl border border-white/10">
                <span aria-hidden="true" className="material-symbols-outlined text-3xl md:text-4xl text-[#96f7e9]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <div className="flex flex-col">
                  <span className="font-bold text-lg">شارة الطالب الموثق</span>
                  <span className="text-xs text-white/70">استخدم إيميلك الجامعي للحصول عليها</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── القسم الأيمن: فورم التسجيل ─── */}
        <section className="flex w-full items-center justify-center bg-surface p-4 sm:p-6 md:w-1/2 md:p-8 lg:p-12 xl:p-16">
          <div className="w-full max-w-md">

            <div className="mb-6 md:mb-8 text-right">
              <div className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-1 brand-font">{platformName}</div>
              <h1 className="text-xl md:text-2xl font-bold text-on-background">إنشاء حساب جديد</h1>
              <p className="text-sm text-on-surface-variant mt-1">ابدأ رحلتك في العمل المجتمعي اليوم</p>
            </div>

            {/* [UX-07] ✅ role="alert" و role="status" */}
            {error && (
              <div role="alert" aria-live="polite" className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-xs md:text-sm text-center font-bold border border-red-200">
                <p>{error}</p>
                {emailAlreadyExists && (
                  <Link
                    href="/login"
                    className="inline-block mt-2 underline underline-offset-2 hover:text-red-900"
                  >
                    الانتقال إلى تسجيل الدخول
                  </Link>
                )}
              </div>
            )}
            {success && (
              <div role="status" aria-live="polite" className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-xs md:text-sm text-center font-bold border border-green-200">
                {success}
              </div>
            )}

            {/* [UX-05] ✅ aria-label على الفورم */}
            <form
              className="space-y-4 md:space-y-5"
              onSubmit={handleSubmit}
              dir="rtl"
              aria-label="نموذج إنشاء حساب جديد"
              noValidate
            >
              {/* الاسم */}
              <div className="space-y-1 md:space-y-2">
                <label htmlFor="reg-name" className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">الاسم الكامل</label>
                <div className="relative">
                  <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">person</span>
                  <input id="reg-name" name="name" type="text" required autoComplete="name" value={formData.name} onChange={handleChange} placeholder="أدخل اسمك الثلاثي"
                    className="w-full pr-12 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm md:text-base" />
                </div>
              </div>

              {/* البريد الإلكتروني */}
              <div className="space-y-1 md:space-y-2">
                <label htmlFor="reg-email" className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">البريد الإلكتروني</label>
                <div className="relative">
                  <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">mail</span>
                  <input id="reg-email" name="email" type="email" required dir="ltr" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="example@university.edu"
                    className="w-full pr-12 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-left text-sm md:text-base" />
                </div>
              </div>

              {/* رقم الهاتف */}
              <div className="space-y-1.5">
                <label htmlFor="reg-phone" className="text-xs font-bold text-on-surface-soft mr-1">رقم الهاتف (للتواصل)</label>
                <div className="relative group">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-[#edeeef] pointer-events-none select-none z-10">
                    <span aria-hidden="true" className="text-sm">🇯🇴</span>
                    <span className="text-sm font-black text-on-surface-variant" dir="ltr">+962</span>
                    <div className="w-px h-4 bg-gray-200" />
                  </div>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    required
                    dir="ltr"
                    inputMode="numeric"
                    pattern="(77|78|79)[0-9]{7}"
                    autoComplete="tel-national"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="791234567"
                    maxLength={9}
                    aria-describedby="phone-hint"
                    aria-invalid={phoneError}
                    className={`w-full pr-28 pl-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-2 outline-none transition-all text-sm md:text-base ${phoneBorderClass}`}
                  />
                </div>
                {/* [UX-10] ✅ رسالة توجيه واضحة */}
                <p id="phone-hint" className={`text-xs mt-1 mr-1 transition-colors ${phoneError ? "text-red-500 font-bold" : phoneValid ? "text-green-600 font-bold" : "text-on-surface-soft"}`}>
                  {phoneError ? "رقم غير صحيح — يجب أن يبدأ بـ 77 أو 78 أو 79 ويكون 9 أرقام"
                    : phoneValid ? "✓ رقم صحيح"
                    : "أدخل 9 أرقام تبدأ بـ 77 أو 78 أو 79"}
                </p>
              </div>

              {/* كلمة المرور */}
              <div className="space-y-1 md:space-y-2">
                <label htmlFor="reg-password" className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">كلمة المرور</label>
                <div className="relative">
                  <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">lock</span>
                  <input id="reg-password" name="password" type={showPassword ? "text" : "password"} required dir="ltr" autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                    className="w-full pr-12 pl-12 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm md:text-base" />
                  {/* [UX-01] ✅ */}
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} aria-pressed={showPassword}
                    className="touch-target absolute left-1 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg text-outline transition-colors hover:text-primary sm:left-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {/* تأكيد كلمة المرور */}
              <div className="space-y-1 md:space-y-2">
                <label htmlFor="reg-confirm-password" className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">تأكيد كلمة المرور</label>
                <div className="relative">
                  <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">lock_reset</span>
                  <input id="reg-confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required dir="ltr" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                    className="w-full pr-12 pl-12 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm md:text-base" />
                  <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                    aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"} aria-pressed={showConfirmPassword}
                    className="touch-target absolute left-1 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg text-outline transition-colors hover:text-primary sm:left-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-xl">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {/* [UX-08] ✅ btn-primary موحَّد */}
              <button type="submit" disabled={loading || !phoneValid} className="btn-primary mt-2">
                {loading ? (
                  <><span aria-hidden="true" className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>جاري الإنشاء...</span></>
                ) : "إنشاء الحساب"}
              </button>

              <p className="text-center text-sm text-on-surface-variant mt-4">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-primary font-bold hover:underline underline-offset-2">تسجيل الدخول</Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
