"use client";

import Link from "next/link";
import { useForgotPassword } from "./hooks/useForgotPassword";

export default function ForgotPasswordPage() {
  const { email, setEmail, message, error, loading, handleSubmit } = useForgotPassword();

  return (
    <div
      className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-[radial-gradient(circle_at_top,var(--color-primary-softer),var(--color-surface)_28rem)] p-4 md:min-h-[calc(100dvh-5rem)]"
      dir="rtl"
    >
      <section className="surface-card w-full max-w-md p-6 text-center sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <span
            className="material-symbols-outlined text-[27px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mark_email_read
          </span>
        </span>
        <h1 className="mt-5 text-2xl font-black text-on-surface">استعادة كلمة المرور</h1>
        <p className="mt-2 text-sm leading-7 text-on-surface-variant">
          أدخل بريد حسابك وسنرسل لك رابطًا آمنًا لتعيين كلمة مرور جديدة.
        </p>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700"
          >
            {message}
          </div>
        )}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-right">
          <label htmlFor="recovery-email" className="block">
            <span className="mb-2 block text-xs font-black text-on-surface-variant">
              البريد الإلكتروني
            </span>
            <span className="relative block">
              <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft">
                mail
              </span>
              <input
                id="recovery-email"
                type="email"
                required
                dir="ltr"
                autoComplete="email"
                className="field-control px-4 pr-11 text-left text-sm font-bold"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </span>
          </label>

          <button type="submit" disabled={loading || !email} className="btn-primary w-full py-3.5">
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                جاري الإرسال...
              </>
            ) : (
              <>
                إرسال رابط الاستعادة
                <span className="material-symbols-outlined text-[18px]">send</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-7 text-sm text-on-surface-variant">
          تذكرت كلمة المرور؟{" "}
          <Link href="/login" className="font-black text-primary hover:underline hover:underline-offset-4">
            العودة لتسجيل الدخول
          </Link>
        </p>
      </section>
    </div>
  );
}
