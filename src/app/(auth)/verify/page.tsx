// src/app/(auth)/verify/page.tsx
"use client";

import { Suspense } from "react";
import { useVerifyEmail } from "./hooks/useVerifyEmail";

interface OtpInputProps {
  digit:    string;
  index:    number;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange:  (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
}

function OtpInput({ digit, index, inputRef, onChange, onKeyDown }: OtpInputProps) {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={1}
      value={digit}
      onChange={(e) => onChange(index, e)}
      onKeyDown={(e) => onKeyDown(index, e)}
      className={`w-12 h-14 text-center text-2xl font-black rounded-2xl outline-none transition-all border-2 bg-surface-container-highest
        ${digit
          ? "border-primary bg-primary/5 text-primary"
          : "border-transparent focus:border-primary/40 focus:bg-white text-[#191c1d]"
        } focus:ring-2 focus:ring-primary/20`}
    />
  );
}

function VerifyContent() {
  const {
    email,
    otp,
    error,
    loading,
    isComplete,
    shouldResend,
    cooldown,
    resending,
    resendMsg,
    inputRefs,
    handleChange,
    handleKeyDown,
    handleSubmit,
    handleResend,
  } = useVerifyEmail();

  return (
    <div
      className="min-h-screen bg-surface flex items-center justify-center p-4 font-body"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-sm border border-[#edeeef] text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl text-primary">
            mark_email_read
          </span>
        </div>

        <h1 className="text-2xl font-black text-[#191c1d] mb-2 font-headline">
          تحقق من بريدك الإلكتروني ✉️
        </h1>

        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
          أدخل الرمز المكون من 6 أرقام الذي أرسلناه إلى:
          <br />
          <span className="font-black text-primary" dir="ltr">
            {email}
          </span>
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-4 border border-red-100">
            {error}
          </div>
        )}

        {/* ✅ إصلاح #3: زر Resend دائم الظهور، مقيّد بالـ Cooldown */}
        <div className="mb-6 min-h-[40px] flex flex-col items-center gap-1">
          {cooldown > 0 ? (
            // ✅ إصلاح #4: عداد تنازلي مرئي
            <p className="text-sm text-gray-400 font-bold">
              يمكنك إعادة الإرسال بعد{" "}
              <span className="text-primary font-black tabular-nums">
                {cooldown}
              </span>{" "}
              ثانية
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-primary font-bold text-sm underline underline-offset-2 hover:text-primary/80 disabled:opacity-50 transition-all"
            >
              {resending ? "جاري الإرسال..." : "لم تستلم الرمز؟ إعادة إرسال 🔄"}
            </button>
          )}

          {resendMsg && (
            <p
              className={`text-xs font-bold ${
                resendMsg.startsWith("✅") ? "text-green-600" : "text-red-500"
              }`}
            >
              {resendMsg}
            </p>
          )}

          {/* ✅ زر إعادة إرسال إضافي عند OTP_ATTEMPTS_EXCEEDED أو OTP_EXPIRED */}
          {shouldResend && cooldown === 0 && (
            <p className="text-xs text-orange-500 font-bold mt-1">
              انتهت صلاحية الرمز أو تجاوزت عدد المحاولات — اطلب رمزاً جديداً 👆
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2" dir="ltr">
            {otp.map((digit: string, index: number) => (
              <OtpInput
                key={index}
                digit={digit}
                index={index}
                inputRef={(el) => { inputRefs.current[index] = el; }}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !isComplete || !email}
            className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 shadow-md shadow-primary/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">verified</span>
                تأكيد الحساب
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}