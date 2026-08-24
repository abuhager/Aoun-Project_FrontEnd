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
      // ✅ ألوان صريحة — لا تعتمد على theme tokens قد تكون غير معرفة
      className={[
        "w-12 h-14 text-center text-2xl font-black rounded-2xl",
        "outline-none transition-all border-2",
        // ✅ autofill override: نفس الخلفية البيضاء حتى لو Chrome يحاول يغيّر
        "[&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]",
        "[&:-webkit-autofill]:[--tw-text-opacity:1] [&:-webkit-autofill]:text-[#191c1d]",
        digit
          ? "border-primary bg-primary/10 text-primary"
          : "border-[#d0d5dd] bg-white text-[#191c1d] focus:border-primary focus:ring-2 focus:ring-primary/20",
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
      className="min-h-dvh flex items-center justify-center p-4 font-body"
      style={{ backgroundColor: "#f5f5f5" }}
      dir="rtl"
    >
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-sm border border-[#edeeef] text-center">

        {/* أيقونة */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span aria-hidden="true" className="material-symbols-outlined text-3xl text-primary">
            mark_email_read
          </span>
        </div>

        <h1 className="text-2xl font-black text-[#191c1d] mb-2 font-headline">
          تحقق من بريدك الإلكتروني ✉️
        </h1>
        <p className="text-sm text-[#5f6368] mb-8 leading-relaxed">
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
        <div className="mb-6 min-h-[40px] flex flex-col items-center gap-1">
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
              {resending ? "جاري الإرسال..." : "لم تستلم الرمز؟ إعادة إرسال 🔄"}
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
              انتهت صلاحية الرمز أو تجاوزت عدد المحاولات — اطلب رمزاً جديداً 👆
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
              className="flex justify-center gap-2"
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
            className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 shadow-md shadow-primary/20"
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
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-dvh flex items-center justify-center"
          style={{ backgroundColor: "#f5f5f5" }}
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