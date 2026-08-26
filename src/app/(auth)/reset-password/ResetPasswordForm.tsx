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
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-surface md:min-h-[calc(100dvh-5rem)]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-[radial-gradient(circle_at_top,var(--color-primary-softer),var(--color-surface)_28rem)] p-4 font-body md:min-h-[calc(100dvh-5rem)]"
      dir="rtl"
    >
      <section className="surface-card w-full max-w-md p-6 text-center sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <span className="material-symbols-outlined text-[27px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isSuccess ? "verified" : "lock_reset"}
          </span>
        </div>

        <h1 className="mt-5 font-headline text-2xl font-black text-on-surface">
          {isSuccess ? "تم التغيير بنجاح!" : "تعيين كلمة مرور جديدة"}
        </h1>
        <p className="mb-7 mt-2 text-sm leading-7 text-on-surface-variant">
          {isSuccess
            ? "تم تحديث كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول."
            : "أدخل كلمة المرور الجديدة الخاصة بك أدناه لضمان أمان حسابك."}
        </p>

        {message && (
          <div role="status" aria-live="polite" className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700">
            {message}
            <p className="mt-2 text-[10px] opacity-80">
              جاري تحويلك لصفحة تسجيل الدخول... ⏳
            </p>
          </div>
        )}
        {error && (
          <div role="alert" aria-live="assertive" className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {!isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            <div className="space-y-2">
              <label htmlFor="reset-password" className="block text-xs font-black text-on-surface-variant">
                كلمة المرور الجديدة
              </label>
              <div className="group relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 z-10 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                  lock
                </span>
                <input
                  id="reset-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="field-control py-3 pl-4 pr-12 text-left text-sm font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reset-password-confirmation" className="block text-xs font-black text-on-surface-variant">
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
                  id="reset-password-confirmation"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="field-control py-3 pl-12 pr-12 text-left text-sm font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="btn-primary mt-4 w-full py-3.5"
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
            className="btn-secondary mt-4"
          >
            العودة لتسجيل الدخول الآن
          </Link>
        )}
      </section>
    </div>
  );
}
