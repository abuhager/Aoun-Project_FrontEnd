// src/app/(auth)/verify/page.tsx
"use client";

import { Suspense } from "react";
import { useVerifyEmail } from "./hooks/useVerifyEmail";

interface OtpInputProps {
  digit:     string;
  index:     number;
  inputRef:  (el: HTMLInputElement | null) => void;
  onChange:  (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste:   (index: number, e: React.ClipboardEvent<HTMLInputElement>) => void;
}

function OtpInput({
  digit, index, inputRef, onChange, onKeyDown, onPaste,
}: OtpInputProps) {
  return (
    <input
      ref={inputRef}
      id={`otp-${index}`}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={1}
      value={digit}
      onChange={(e)  => onChange(index, e)}
      onKeyDown={(e) => onKeyDown(index, e)}
      onPaste={(e)   => onPaste(index, e)}
      autoComplete={index === 0 ? "one-time-code" : "off"}
      aria-label={`الرقم ${index + 1} من رمز التحقق`}
      className={[
        "h-12 w-full min-w-0 rounded-xl text-center text-xl font-black sm:h-14 sm:text-2xl",
        "outline-none transition-all border-2",
        "[&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]",
        "[&:-webkit-autofill]:[--tw-text-opacity:1] [&:-webkit-autofill]:text-[#191c1d]",
        digit
          ? "border-primary bg-primary-soft text-primary"
          : "border-outline-variant bg-white text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20",
      ].join(" ")}
    />
  );
}

function VerifyContent() {
  const {
    email, otp, error, loading, isComplete,
    shouldResend, cooldown, resending, resendMsg,
    inputRefs, handleChange, handleKeyDown,
    handlePaste, handleSubmit, handleResend,
  } = useVerifyEmail();

  return (
    <div
      className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-[radial-gradient(circle_at_top,var(--color-primary-softer),var(--color-surface)_28rem)] p-4 font-body md:min-h-[calc(100dvh-5rem)]"
      dir="rtl"
    >
      <section className="surface-card w-full max-w-md p-5 text-center sm:p-8">

        {/* أيقونة */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <span aria-hidden="true" className="material-symbols-outlined text-[27px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            mark_email_read
          </span>
        </div>

        <h1 className="mt-5 text-2xl font-black text-on-surface">
          تحقق من بريدك الإلكتروني
        </h1>
        <p className="mb-7 mt-2 text-sm leading-7 text-on-surface-variant">
          أدخل الرمز المكون من 6 أرقام الذي أرسلناه إلى:
          <br />
          <span className="font-black text-primary" dir="ltr">{email}</span>
        </p>

        {/* خطأ */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-4 border border-red-100"
          >
            {error}
          </div>
        )}

        {/* إعادة إرسال */}
        <div className="mb-6 flex min-h-10 flex-col items-center gap-1">
          {cooldown > 0 ? (
            <p className="text-sm text-gray-500 font-bold">
              يمكنك إعادة الإرسال بعد{" "}
              <span className="text-primary font-black tabular-nums">{cooldown}</span>
              {" "}ثانية
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-primary font-bold text-sm underline underline-offset-2 hover:text-primary/80 disabled:opacity-50 transition-all"
            >
              {resending ? "جاري الإرسال..." : "لم تستلم الرمز؟ إعادة إرسال"}
            </button>
          )}

          {resendMsg && (
            <p
              role="status"
              aria-live="polite"
              className={`text-xs font-bold ${resendMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}
            >
              {resendMsg}
            </p>
          )}

          {shouldResend && cooldown === 0 && (
            <p className="text-xs text-orange-500 font-bold mt-1">
              انتهت صلاحية الرمز أو تجاوزت عدد المحاولات — اطلب رمزاً جديداً.
            </p>
          )}
        </div>

        {/* فورم OTP */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8"
          aria-label="نموذج التحقق برمز OTP"
          noValidate
        >
          <fieldset>
            <legend className="sr-only">رمز التحقق المكون من 6 أرقام</legend>
            <div
              className="grid grid-cols-6 gap-1.5 sm:gap-2"
              dir="ltr"
              role="group"
              aria-label="خانات رمز التحقق"
            >
              {otp.map((digit, index) => (
                <OtpInput
                  key={index}
                  digit={digit}
                  index={index}
                  inputRef={(el) => { inputRefs.current[index] = el; }}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                />
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading || !isComplete || !email}
            className="btn-primary w-full py-3.5"
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                />
                <span>جاري التحقق...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="material-symbols-outlined text-xl">
                  verified
                </span>
                تأكيد الحساب
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-surface md:min-h-[calc(100dvh-5rem)]"
          role="status"
          aria-label="جاري التحميل"
        >
          <div
            aria-hidden="true"
            className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
          />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
