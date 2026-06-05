// src/app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRedirectIfAuth } from "../hooks/useRedirectIfAuth";
import { useLogin } from "./hooks/useLogin";
import { useSettings } from "@/hooks/useSettings"; 

export default function LoginPage() {
  useRedirectIfAuth();
  const { formData, loading, error, handleChange, handleSubmit } = useLogin();

  // ✅ جلب الإعدادات الحية
  const { settings, isLoading: settingsLoading } = useSettings();
  
  // ✅ معالجة الـ Type-safety للحقل المغلّف بدون any نهائياً وبطريقة توافق الـ Build
  const platformName = settings?.platformName ?? "عون";

  return (
    <main className="grow flex flex-row-reverse overflow-hidden min-h-screen bg-background" dir="rtl">

      {/* ─── القسم الأيمن: الفورم ─── */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-surface z-10 relative">
        <div className="w-full max-w-md space-y-10">

          {/* العنوان */}
          <div className="flex flex-col items-start gap-2">
            {/* عرض الاسم الحي ديناميكياً بدون مشاكل كاش أو تايب */}
            <span className="text-3xl font-black text-primary tracking-tight">
              {settingsLoading ? "..." : platformName}
            </span>
            <h1 className="text-4xl font-extrabold text-on-background leading-tight">مرحباً بك مجدداً</h1>
            <p className="text-on-surface-variant">سجل دخولك لتستمر in رحلة العطاء والمساعدة</p>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* الفورم */}
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
                    dir="ltr"
                    placeholder="name@example.com"
                    className="w-full pr-12 pl-6 py-4 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline outline-none text-left"
                  />
                </div>
              </div>

              {/* كلمة المرور */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-sm font-bold text-on-surface-variant">كلمة المرور</label>
                  <a href="/forgot-password" className="text-sm font-bold text-primary hover:text-primary-container transition-colors">
                    نسيت كلمة المرور؟
                  </a>
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
                    dir="ltr"
                    placeholder="••••••••"
                    className="w-full pr-12 pl-6 py-4 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline outline-none text-left"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-8 bg-linear-to-br from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className="text-center text-on-surface-variant">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4 decoration-primary/30">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </section>

      {/* ─── القسم الأيسر: الصورة ─── */}
      <section className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-primary">
          <Image
            src="/Volunteer-Background.png"
            alt="Volunteer Background"
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
              <p className="text-sm font-medium text-white/90">انضم لأكثر من ١٥٠ متطوع ومتبرع اليوم</p>
            </div>
          </div>
        </div>

        <div className="absolute top-12 left-12 w-32 h-32 bg-secondary/40 rounded-full blur-3xl" />
      </section>
    </main>
  );
}