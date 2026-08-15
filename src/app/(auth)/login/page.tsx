"use client";

import Link from "next/link";
import Image from "next/image";
import { useRedirectIfAuth } from "../hooks/useRedirectIfAuth";
import { useLogin } from "./hooks/useLogin";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function LoginPage() {
  useRedirectIfAuth();
  const { formData, loading, error, handleChange, handleSubmit } = useLogin();
  const { platformName } = useSiteConfig();

  // ⚡ دالة مساعدة لتعبئة بيانات الحساب التجريبي بنقرة واحدة
  const handleQuickFill = (email: string) => {
    const syntheticEvent = (name: string, value: string) =>
      ({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);

    handleChange(syntheticEvent("email", email));
    handleChange(syntheticEvent("password", "1870547aA"));
  };

  return (
    <main
      className="grow flex flex-row-reverse overflow-hidden min-h-screen bg-background"
      dir="rtl"
    >
      {/* ─── القسم الأيمن: الفورم ─── */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-surface z-10 relative">
        <div className="w-full max-w-md space-y-8">

          <div className="flex flex-col items-start gap-2">
            <span className="text-3xl font-black text-primary tracking-tight">
              {platformName}
            </span>
            <h1 className="text-4xl font-extrabold text-on-background leading-tight">
              مرحباً بك مجدداً
            </h1>
            <p className="text-on-surface-variant">
              سجل دخولك لتستمر في رحلة العطاء والمساعدة
            </p>
          </div>

          {/* 🌟 بطاقات سريعة لتسجيل حسابات الديمو (Demo Accounts) */}
          <div className="p-4 rounded-xl bg-surface-container-highest border border-outline-variant/30 space-y-2">
            <p className="text-xs font-bold text-on-surface-variant">
              ⚡ تجربة سريعة (Demo Accounts):
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@aoun.jo")}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                🛡️ مسؤول (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("donor@gmail.com")}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                🎁 متبرع (Donor)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("sara@student.ju.edu.jo")}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
              >
                🎓 مستلمة (Student)
              </button>
            </div>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            aria-label="نموذج تسجيل الدخول"
            noValidate
          >
            <div className="space-y-4">

              {/* البريد الإلكتروني */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="login-email"
                  className="text-sm font-bold text-on-surface-variant px-2"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative group">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors"
                  >
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
                    className="w-full pr-12 pl-6 py-4 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline outline-none text-left"
                  />
                </div>
              </div>

              {/* كلمة المرور */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-2">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-bold text-on-surface-variant"
                  >
                    كلمة المرور
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-bold text-primary hover:text-primary-container transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <div className="relative group">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors"
                  >
                    lock
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pr-12 pl-6 py-4 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline outline-none text-left"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-lg w-full py-4 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                  />
                  <span>جاري الدخول...</span>
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          <p className="text-center text-on-surface-variant">
            ليس لديك حساب؟{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline underline-offset-4 decoration-primary/30"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </section>

      {/* ─── القسم الأيسر: الصورة (decorative) ─── */}
      <section
        className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 w-full h-full bg-primary">
          <Image
            src="/Volunteer-Background.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover mix-blend-overlay opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
        </div>

        <div className="absolute bottom-16 right-16 left-16 glass-effect p-12 rounded-2xl border border-white/10 text-white shadow-2xl">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold leading-relaxed">
              &quot;نحن هنا لنكون عوناً لبعضنا البعض، خطوة واحدة يمكنها تغيير حياة الكثيرين.&quot;
            </h2>
            <div className="flex items-center gap-4 pt-6 border-t border-white/20 mt-6">
              <div className="flex -space-x-4 space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold border-2 border-primary z-10">
                  +١٥٠
                </div>
              </div>
              <p className="text-sm font-medium text-white/90">
                انضم لأكثر من ١٥٠ متطوع ومتبرع اليوم
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-12 left-12 w-32 h-32 bg-secondary/40 rounded-full blur-3xl" />
      </section>
    </main>
  );
}
