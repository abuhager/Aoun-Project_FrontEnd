"use client";

import { Suspense } from "react";
import { useVerifyEmail } from "./hooks/useVerifyEmail";

// ─── المحتوى الفعلي (بداخل Suspense لأن useSearchParams يحتاجه) ───
function VerifyContent() {
  const {
    email, otp, error, loading, isComplete,
    inputRefs, handleChange, handleKeyDown, handleSubmit,
  } = useVerifyEmail();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-body" dir="rtl">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-sm border border-[#edeeef] text-center">

        {/* ─── الأيقونة ─── */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl text-primary">mark_email_read</span>
        </div>

        <h1 className="text-2xl font-black text-[#191c1d] mb-2 font-headline">
          تحقق من بريدك الإلكتروني ✉️
        </h1>
        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
          أدخل الرمز المكون من 4 أرقام الذي أرسلناه إلى:
          <br />
          <span className="font-black text-primary" dir="ltr">{email}</span>
        </p>

        {/* ─── رسالة الخطأ ─── */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ─── خانات الـ OTP ─── */}
          <div className="flex justify-center gap-3" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-14 h-14 text-center text-2xl font-black rounded-2xl outline-none transition-all border-2 bg-surface-container-highest
                  ${digit
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent focus:border-primary/40 focus:bg-white text-[#191c1d]"
                  } focus:ring-2 focus:ring-primary/20`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !isComplete}
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

// ─── Suspense ضروري لأن useSearchParams يحتاجه Next.js ───
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