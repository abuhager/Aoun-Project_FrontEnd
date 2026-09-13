"use client";

import Link from "next/link";
import { useState } from "react";
import { useResetPassword } from "./hooks/useResetPassword";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
              <label htmlFor="reset-password" className="block w-full text-right text-xs font-black leading-5 text-on-surface-variant">
                كلمة المرور الجديدة
              </label>
              <div className="group relative">
                <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 z-10 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                  lock
                </span>
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  required
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="field-control py-3 pl-12 pr-12 text-left text-sm font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal"
                />
                <PasswordVisibilityButton
                  visible={showPassword}
                  label="كلمة المرور الجديدة"
                  onToggle={() => setShowPassword((visible) => !visible)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reset-password-confirmation" className="block w-full text-right text-xs font-black leading-5 text-on-surface-variant">
                تأكيد كلمة المرور
              </label>
              <div className="group relative">
                <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 z-10 -translate-y-1/2 text-xl text-outline transition-colors group-focus-within:text-primary">
                  lock
                </span>
                {passwordsMatch && (
                  <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute left-12 top-1/2 z-10 -translate-y-1/2 text-xl text-green-500">
                    check_circle
                  </span>
                )}
                <input
                  id="reset-password-confirmation"
                  type={showConfirmation ? "text" : "password"}
                  required
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="field-control py-3 pl-20 pr-12 text-left text-sm font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal"
                />
                <PasswordVisibilityButton
                  visible={showConfirmation}
                  label="تأكيد كلمة المرور"
                  onToggle={() => setShowConfirmation((visible) => !visible)}
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

function PasswordVisibilityButton({
  visible,
  label,
  onToggle,
}: {
  visible: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? `إخفاء ${label}` : `إظهار ${label}`}
      aria-pressed={visible}
      className="absolute left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-on-surface-soft transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
        {visible ? "visibility_off" : "visibility"}
      </span>
    </button>
  );
}
