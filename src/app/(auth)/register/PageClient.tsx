"use client";

import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useRedirectIfAuth } from "../hooks/useRedirectIfAuth";
import { useRegister } from "./hooks/useRegister";

const JORDAN_PHONE_REGEX = /^(77|78|79)\d{7}$/;

export default function RegisterClient() {
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const phoneTouched = formData.phone.length > 0;
  const phoneValid = JORDAN_PHONE_REGEX.test(formData.phone);
  const phoneError = phoneTouched && !phoneValid;
  const phoneBorderClass = phoneError
    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
    : phoneValid
      ? "border-green-500 focus:border-green-600 focus:ring-4 focus:ring-green-100"
      : "";

  return (
    <AuthShell
      platformName={platformName}
      eyebrow={`انضم إلى ${platformName}`}
      icon="person_add"
      title="إنشاء حساب جديد"
      description="أنشئ حسابك بخطوات واضحة، ثم ابدأ التبرع أو طلب الأغراض بأمان."
      size="wide"
    >
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700"
        >
          <p>{error}</p>
          {emailAlreadyExists && (
            <Link
              href="/login"
              className="mt-2 inline-block rounded underline underline-offset-2 hover:text-red-900"
            >
              الانتقال إلى تسجيل الدخول
            </Link>
          )}
        </div>
      )}

      {success && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700"
        >
          {success}
        </div>
      )}

      <form
        className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2"
        onSubmit={handleSubmit}
        dir="rtl"
        aria-label="نموذج إنشاء حساب جديد"
        noValidate
      >
        <label className="block" htmlFor="reg-name">
          <span className="mb-2 block text-xs font-black text-on-surface-variant">
            الاسم الكامل
          </span>
          <span className="relative block">
            <span
              aria-hidden="true"
              className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft"
            >
              person
            </span>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسمك الكامل"
              className="field-control px-4 pr-11 text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70"
            />
          </span>
        </label>

        <label className="block" htmlFor="reg-email">
          <span className="mb-2 block text-xs font-black text-on-surface-variant">
            البريد الإلكتروني
          </span>
          <span className="relative block">
            <span
              aria-hidden="true"
              className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft"
            >
              mail
            </span>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              dir="ltr"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="field-control px-4 pr-11 text-left text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70"
            />
          </span>
        </label>

        <div className="sm:col-span-2">
          <label htmlFor="reg-phone" className="mb-2 block text-xs font-black text-on-surface-variant">
            رقم الهاتف للتواصل
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute right-2 top-1/2 z-10 flex -translate-y-1/2 select-none items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1.5">
              <span aria-hidden="true" className="text-sm">
                🇯🇴
              </span>
              <span className="text-sm font-black text-on-surface-variant" dir="ltr">
                +962
              </span>
              <span aria-hidden="true" className="h-4 w-px bg-outline-variant" />
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
              className={`field-control px-4 pr-28 text-left text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70 ${phoneBorderClass}`}
            />
          </div>
          <p
            id="phone-hint"
            className={`mt-1.5 text-[11px] font-bold ${
              phoneError
                ? "text-red-600"
                : phoneValid
                  ? "text-green-700"
                  : "text-on-surface-soft"
            }`}
          >
            {phoneError
              ? "الرقم يجب أن يتكون من 9 أرقام ويبدأ بـ 77 أو 78 أو 79"
              : phoneValid
                ? "✓ رقم الهاتف صحيح"
                : "أدخل الرقم المحلي دون الصفر الأول"}
          </p>
        </div>

        <div>
          <label htmlFor="reg-password" className="mb-2 block text-xs font-black text-on-surface-variant">
            كلمة المرور
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft"
            >
              lock
            </span>
            <input
              id="reg-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              dir="ltr"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="field-control px-11 text-left text-sm font-bold placeholder:text-on-surface-soft/70"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              aria-pressed={showPassword}
              className="touch-target absolute left-0 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-soft hover:text-primary"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[19px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-confirm-password"
            className="mb-2 block text-xs font-black text-on-surface-variant"
          >
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft"
            >
              lock_reset
            </span>
            <input
              id="reg-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              dir="ltr"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="field-control px-11 text-left text-sm font-bold placeholder:text-on-surface-soft/70"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
              aria-pressed={showConfirmPassword}
              className="touch-target absolute left-0 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-soft hover:text-primary"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[19px]">
                {showConfirmPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-1 sm:col-span-2">
          <button type="submit" disabled={loading || !phoneValid} className="btn-primary w-full py-3.5">
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                />
                جاري إنشاء الحساب...
              </>
            ) : (
              <>
                إنشاء الحساب
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
              </>
            )}
          </button>

          <p className="mt-5 border-t border-black/[0.06] pt-5 text-center text-sm text-on-surface-variant">
            لديك حساب بالفعل؟{" "}
            <Link
              href="/login"
              className="rounded font-black text-primary hover:text-primary-container hover:underline hover:underline-offset-4"
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
