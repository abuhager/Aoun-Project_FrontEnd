// src/app/(auth)/verify/hooks/useVerifyEmail.ts
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { verifyOtp, resendOtp } from "@/lib/api/authApi";

type OtpErrorCode = "OTP_ATTEMPTS_EXCEEDED" | "OTP_EXPIRED" | "RESEND_TOO_FAST" | string;

interface ApiErrorShape {
  response?: {
    data?:   { msg?: string; code?: OtpErrorCode };
    status?: number;
  };
  isAxiosError?: boolean;
}

const COOLDOWN_SECONDS = 60; // ✅ يطابق COOLDOWN_MS في الـ Backend

export function useVerifyEmail() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email");
  const { setUser }  = useAuth();

  const [otp,     setOtp]     = useState<string[]>(["", "", "", "", "", ""]);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [shouldResend, setShouldResend] = useState(false);

  // ✅ إصلاح #4: Cooldown Timer State
  const [cooldown,    setCooldown]    = useState(0);  // ثوانٍ متبقية
  const [resending,   setResending]   = useState(false);
  const [resendMsg,   setResendMsg]   = useState("");
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ✅ تشغيل عداد تنازلي عند بدء Cooldown
  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // تنظيف الـ interval عند unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const value  = e.target.value.replace(/\D/g, "");
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const resetOtpInputs = useCallback(() => {
    setOtp(["", "", "", "", "", ""]);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) { setError("لا يوجد بريد إلكتروني للتحقق"); return; }

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("الرجاء إدخال الرمز المكون من 6 أرقام 🛑");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setShouldResend(false);

      const data = await verifyOtp({ email, otp: otpCode });

      if (data.accessToken) {
        setUser(data.user ?? null);
        router.push("/browse");
      } else {
        router.push("/login?verified=true");
      }
    } catch (err: unknown) {
      const axiosErr = err as ApiErrorShape;

      if (axiosErr?.isAxiosError) {
        const code    = axiosErr.response?.data?.code;
        const message = axiosErr.response?.data?.msg ?? "حدث خطأ أثناء التحقق من الرمز ❌";

        setError(message);

        if (code === "OTP_ATTEMPTS_EXCEEDED" || code === "OTP_EXPIRED") {
          setShouldResend(true);
        }

        resetOtpInputs();
      } else {
        setError("حدث خطأ غير متوقع ❌");
        resetOtpInputs();
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ إصلاح #3 + #4: handleResend مع Cooldown مرئي
  const handleResend = useCallback(async () => {
    if (!email || cooldown > 0 || resending) return;

    try {
      setResending(true);
      setResendMsg("");

      await resendOtp({ email });

      setResendMsg("✅ تم إرسال رمز جديد إلى بريدك 📧");
      setShouldResend(false);
      resetOtpInputs();
      startCooldown(); // ✅ بدء العداد بعد الإرسال الناجح
    } catch (err: unknown) {
      const axiosErr = err as ApiErrorShape;
      const code     = axiosErr?.response?.data?.code;
      const msg      = axiosErr?.response?.data?.msg ?? "فشل الإرسال، حاول بعد قليل ⚠️";

      setResendMsg(msg);

      // ✅ إذا Backend أعاد RESEND_TOO_FAST → شغّل العداد في الـ Frontend أيضاً
      if (code === "RESEND_TOO_FAST") {
        startCooldown();
      }
    } finally {
      setResending(false);
    }
  }, [email, cooldown, resending, resetOtpInputs, startCooldown]);

  const isComplete = otp.every((d) => d !== "");

  return {
    email,
    otp,
    error,
    loading,
    isComplete,
    shouldResend,
    cooldown,      // ✅ جديد — الثوانٍ المتبقية للعداد
    resending,     // ✅ نُعيد resending من هنا
    resendMsg,     // ✅ نُعيد resendMsg من هنا
    inputRefs,
    handleChange,
    handleKeyDown,
    handleSubmit,
    handleResend,  // ✅ نُعيد handleResend موحداً من الـ hook
  };
}