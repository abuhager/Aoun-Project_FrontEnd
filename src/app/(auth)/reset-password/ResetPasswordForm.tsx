"use client";

import Link from "next/link";
import { useResetPassword } from "./hooks/useResetPassword";

export default function ResetPasswordForm() {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    message,
    error,
    loading,
    isSuccess,
    isDisabled,
    passwordsMatch,
    tokenReady,
    handleSubmit,
  } = useResetPassword();

  if (!tokenReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-surface p-4 font-body"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#edeeef] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <span className="material-symbols-outlined text-3xl text-primary">
            {isSuccess ? "verified" : "lock_reset"}
          </span>
        </div>

        <h1 className="mb-2 font-headline text-2xl font-black text-[#191c1d]">
          {isSuccess ? "تم التغيير بنجاح!" : "تعيين كلمة مرور جديدة"}
        </h1>
        <p className="mb-8 text-sm text-on-surface-variant">
          {isSuccess
            ? "تم تحديث كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول."
            : "أدخل كلمة المرور الجديدة الخاصة بك أدناه لضمان أمان حسابك."}
        </p>

        {message && (
          <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700">
            {message}
            <p className="mt-2 text-[10px] opacity-80">
              جاري تحويلك لصفحة تسجيل الدخول... ⏳
            </p>
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {!isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            <div className="space-y-2">
              <label className="mr-2 block text-xs font-bold text-gray-500">
                كلمة المرور الجديدة
              </label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 z-10 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                  lock
                </span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border-none bg-surface-container-highest py-4 pl-4 pr-12 text-sm font-bold tracking-widest outline-none transition-all placeholder:font-normal placeholder:tracking-normal focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="mr-2 block text-xs font-bold text-gray-500">
                تأكيد كلمة المرور
              </label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 z-10 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                  lock
                </span>
                {passwordsMatch && (
                  <span className="material-symbols-outlined absolute left-4 top-1/2 z-10 -translate-y-1/2 text-xl text-green-500">
                    check_circle
                  </span>
                )}
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border-none bg-surface-container-highest py-4 pl-12 pr-12 text-sm font-bold tracking-widest outline-none transition-all placeholder:font-normal placeholder:tracking-normal focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-black text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-container active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">
                    published_with_changes
                  </span>
                  حفظ وتغيير كلمة المرور
                </>
              )}
            </button>
          </form>
        )}

        {isSuccess && (
          <Link
            href="/login"
            className="mt-4 inline-block rounded-full bg-surface-container-low px-8 py-3 text-sm font-bold text-on-surface-variant shadow-sm transition-colors hover:bg-gray-200"
          >
            العودة لتسجيل الدخول الآن
          </Link>
        )}
      </div>
    </div>
  );
}

