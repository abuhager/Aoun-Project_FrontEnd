// src/components/PhoneVerifyModal.tsx
// ✅ Phase 2 — نموذج التحقق من الهاتف عبر WhatsApp OTP
// خطوتان: 1) إدخال رقم الهاتف  2) إدخال OTP
"use client";

import { useState } from "react";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/api/phoneApi";
import { useAuth } from "@/context/AuthContext";
import type { VerifyStep } from "@/types/phone.types";

interface PhoneVerifyModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  onSuccess?: () => void;
}

// ─── تحقق من صيغة رقم الهاتف ───────────────────────────────
// ⚠️ DEV: يقبل أي رقم دولي للتجربة — غيّره لأردني فقط في Production
// PROD: /^(\+962|00962|0)?7[789]\d{7}$/
const IS_DEV      = process.env.NODE_ENV !== "production";
const PHONE_REGEX = IS_DEV
  ? /^[+]?[\d\s\-().]{7,15}$/        // DEV: يقبل أي رقم دولي
  : /^(\+962|00962|0)?7[789]\d{7}$/; // PROD: أردني فقط

export default function PhoneVerifyModal({
  isOpen,
  onClose,
  onSuccess,
}: PhoneVerifyModalProps) {
  const { refreshSession } = useAuth();

  const [step,      setStep]      = useState<VerifyStep>("phone");
  const [phone,     setPhone]     = useState("");
  const [otp,       setOtp]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  function handleClose() {
    setStep("phone");
    setPhone("");
    setOtp("");
    setError(null);
    onClose();
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!PHONE_REGEX.test(phone.trim())) {
      setError(
        IS_DEV
          ? "رقم الهاتف غير صالح — أدخل رقماً صحيحاً"
          : "رقم الهاتف غير صالح — يجب أن يكون رقماً أردنياً (07x)"
      );
      return;
    }

    setIsLoading(true);
    try {
      await sendPhoneOtp({ phone: phone.trim() });
      setStep("otp");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { msg?: string } } })
          ?.response?.data?.msg ?? "فشل الإرسال، حاول مجدداً";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(otp)) {
      setError("الرمز يجب أن يتكون من 6 أرقام");
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyPhoneOtp(otp);

      if (res.requiresRefresh) {
        await refreshSession();
      }

      setStep("success");
      onSuccess?.();

      setTimeout(handleClose, 2000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { msg?: string } } })
          ?.response?.data?.msg ?? "رمز غير صحيح أو انتهت صلاحيته";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute left-4 top-4 text-zinc-400 hover:text-zinc-600"
          aria-label="إغلاق"
        >
          ✕
        </button>

        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
              تحقق من رقم هاتفك 📱
            </h2>
            <p className="text-sm text-zinc-500">
              سنرسل رمز تحقق إلى WhatsApp الخاص بك لرفع مستوى ثقتك
            </p>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                رقم الهاتف
              </label>
              <input
                id="phone"
                type="tel"
                dir="ltr"
                placeholder={IS_DEV ? "+13322568356" : "مثال: 0791234567"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                disabled={isLoading}
                required
              />
            </div>

            {IS_DEV && (
              <p className="text-xs text-amber-500">
                ⚠️ وضع التطوير — يقبل أي رقم دولي
              </p>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
            >
              {isLoading ? "جارٍ الإرسال..." : "إرسال الرمز عبر WhatsApp"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
              أدخل رمز التحقق 🔐
            </h2>
            <p className="text-sm text-zinc-500">
              أرسلنا رمزاً من 6 أرقام إلى{" "}
              <span className="font-semibold text-teal-600">{phone}</span>
            </p>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="otp"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                رمز التحقق
              </label>
              <input
                id="otp"
                type="text"
                dir="ltr"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
            >
              {isLoading ? "جارٍ التحقق..." : "تأكيد الرمز"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
              className="text-sm text-zinc-400 hover:text-teal-600"
            >
              تغيير الرقم أو إعادة الإرسال
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="text-5xl">🎉</span>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
              تم التحقق بنجاح!
            </h2>
            <p className="text-sm text-zinc-500">
              أصبح بإمكانك الآن حجز العناصر
            </p>
          </div>
        )}
      </div>
    </div>
  );
}