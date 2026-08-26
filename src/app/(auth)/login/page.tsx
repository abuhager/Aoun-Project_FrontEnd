"use client";

import Link from "next/link";
import { useState } from "react";
import AuthSidePanel from "@/components/auth/AuthSidePanel";
import { DEMO_ACCOUNTS } from "@/config/demoAccounts";
import { featureFlags } from "@/config/features";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useRedirectIfAuth } from "../hooks/useRedirectIfAuth";
import { useLogin } from "./hooks/useLogin";

export default function LoginPage() {
  useRedirectIfAuth();
  const {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit,
    fillDemoCredentials,
  } = useLogin();
  const { platformName } = useSiteConfig();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="flex min-h-[calc(100dvh-4rem)] bg-white md:min-h-[calc(100dvh-5rem)]"
      dir="rtl"
    >
      <section className="flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-[54%] lg:px-12 xl:px-20">
        <div className="w-full max-w-md">
          <span className="eyebrow">
            <span className="material-symbols-outlined text-[15px]">waving_hand</span>
            مرحباً بعودتك
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
            تسجيل الدخول
          </h1>
          <p className="mt-2 text-sm leading-7 text-on-surface-variant">
            تابع تبرعاتك وطلباتك والمحادثات المرتبطة بها.
          </p>

          {featureFlags.demoLogin && (
            <section
              aria-labelledby="demo-accounts-title"
              className="mt-6 rounded-2xl border border-outline-variant/70 bg-primary-softer p-4"
            >
              <h2 id="demo-accounts-title" className="text-sm font-black text-on-surface">
                حسابات تجريبية
              </h2>
              <p className="mt-1 text-xs text-on-surface-soft">
                اختر حساباً لتعبئة بيانات الدخول تلقائياً.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => fillDemoCredentials(account.email, account.password)}
                    className={`min-h-10 rounded-lg px-3 py-2 text-xs font-bold ${account.buttonClassName}`}
                  >
                    <span aria-hidden="true">{account.icon}</span> {account.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
            aria-label="نموذج تسجيل الدخول"
            noValidate
          >
            <label className="block" htmlFor="login-email">
              <span className="mb-2 block text-xs font-black text-on-surface-variant">
                البريد الإلكتروني
              </span>
              <span className="relative block">
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft">
                  mail
                </span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  dir="ltr"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="field-control px-4 pr-11 text-left text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70"
                />
              </span>
            </label>

            <div>
              <span className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="login-password" className="text-xs font-black text-on-surface-variant">
                  كلمة المرور
                </label>
                <Link
                  href="/forgot-password"
                  className="rounded text-xs font-black text-primary hover:text-primary-container"
                >
                  نسيت كلمة المرور؟
                </Link>
              </span>
              <span className="relative block">
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  dir="ltr"
                  autoComplete="current-password"
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
              </span>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                  />
                  جاري الدخول...
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-on-surface-variant">
            ليس لديك حساب؟{" "}
            <Link
              href="/register"
              className="rounded font-black text-primary hover:text-primary-container hover:underline hover:underline-offset-4"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </section>

      <AuthSidePanel platformName={platformName} />
    </div>
  );
}
