"use client";

import Link from "next/link";
import { useState } from "react";
import AuthSidePanel from "@/components/auth/AuthSidePanel";
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
    <div
      className="flex min-h-[calc(100dvh-4rem)] bg-white md:min-h-[calc(100dvh-5rem)]"
      dir="rtl"
    >
        <section className="flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-[54%] lg:px-12 xl:px-20">
          <div className="w-full max-w-md">

            <div className="mb-7 text-right">
              <span className="eyebrow">
                <span className="material-symbols-outlined text-[15px]">person_add</span>
                انضم إلى {platformName}
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
                إنشاء حساب جديد
              </h1>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                أدخل معلوماتك الأساسية لتبدأ التبرع أو طلب الأغراض.
              </p>
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
                    className="field-control w-full py-3 pr-12 pl-4 text-sm font-bold" />
                </div>
              </div>

              {/* البريد الإلكتروني */}
              <div className="space-y-1 md:space-y-2">
                <label htmlFor="reg-email" className="block text-xs md:text-sm font-bold text-on-surface-variant mr-1">البريد الإلكتروني</label>
                <div className="relative">
                  <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-xl">mail</span>
                  <input id="reg-email" name="email" type="email" required dir="ltr" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="example@university.edu"
                    className="field-control w-full py-3 pr-12 pl-4 text-left text-sm font-bold" />
                </div>
              </div>

              {/* رقم الهاتف */}
              <div className="space-y-1.5">
                <label htmlFor="reg-phone" className="text-xs font-bold text-on-surface-soft mr-1">رقم الهاتف (للتواصل)</label>
                <div className="relative group">
                  <div className="pointer-events-none absolute right-2 top-1/2 z-10 flex -translate-y-1/2 select-none items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1.5">
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
                    className={`field-control w-full py-3 pr-28 pl-4 text-left text-sm font-bold ${phoneBorderClass}`}
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
                    className="field-control w-full py-3 pr-12 pl-12 text-left text-sm font-bold" />
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
                    className="field-control w-full py-3 pr-12 pl-12 text-left text-sm font-bold" />
                  <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                    aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"} aria-pressed={showConfirmPassword}
                    className="touch-target absolute left-1 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg text-outline transition-colors hover:text-primary sm:left-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-xl">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {/* [UX-08] ✅ btn-primary موحَّد */}
              <button type="submit" disabled={loading || !phoneValid} className="btn-primary mt-2 w-full py-3.5">
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

        <AuthSidePanel
          platformName={platformName}
          title="ابدأ حسابك بخطوات بسيطة وواضحة"
          description="بياناتك الأساسية تساعدنا على تنظيم التواصل وحماية تجربة التبادل للطرفين."
        />
    </div>
  );
}
