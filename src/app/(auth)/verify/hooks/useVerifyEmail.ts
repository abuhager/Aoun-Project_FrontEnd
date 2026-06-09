// src/app/(auth)/verify/hooks/useVerifyEmail.ts
// ✅ إضافة: عرض رسالة OTP_ATTEMPTS_EXCEEDED + OTP_EXPIRED بشكل واضح
// ✅ إضافة: إعادة تعيين الـ OTP inputs عند الخطأ لتحسين UX
// ✅ استخدام authApi.verifyOtp المركزي بدلاً من axiosInstance مباشرة

"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { verifyOtp } from "@/lib/api/authApi"; // ✅ API layer المركزي

// رموز الأخطاء المعروفة من الـ Backend
type OtpErrorCode = "OTP_ATTEMPTS_EXCEEDED" | "OTP_EXPIRED" | string;

interface ApiErrorShape {
  response?: {
    data?: { msg?: string; code?: OtpErrorCode };
    status?: number;
  };
  isAxiosError?: boolean;
}

export function useVerifyEmail() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email");
  const { setUser }  = useAuth();

  const [otp,     setOtp]     = useState<string[]>(["", "", "", "", "", ""]);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  // ✅ جديد — لإظهار زر "إعادة إرسال" عند انتهاء الصلاحية أو تجاوز المحاولات
  const [shouldResend, setShouldResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "");
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
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

  // ✅ إعادة تعيين كامل لـ OTP inputs
  const resetOtpInputs = useCallback(() => {
    setOtp(["", "", "", "", "", ""]);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("لا يوجد بريد إلكتروني للتحقق");
      return;
    }

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("الرجاء إدخال الرمز المكون من 6 أرقام 🛑");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setShouldResend(false);

      // ✅ يستخدم authApi.verifyOtp المركزي الذي يضبط session_active cookie
      const data = await verifyOtp({ email, otp: otpCode });

      if (data.accessToken) {
        setUser(data.user);
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

        // ✅ عرض زر "إعادة إرسال" عند هذه الحالات تحديداً
        if (code === "OTP_ATTEMPTS_EXCEEDED" || code === "OTP_EXPIRED") {
          setShouldResend(true);
        }

        // ✅ أعِد تعيين الـ inputs دائماً عند أي خطأ للسماح بإعادة المحاولة
        resetOtpInputs();
      } else {
        setError("حدث خطأ غير متوقع ❌");
        resetOtpInputs();
      }
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return {
    email,
    otp,
    error,
    loading,
    isComplete,
    shouldResend, // ✅ جديد — يُستخدم في الـ UI
    inputRefs,
    handleChange,
    handleKeyDown,
    handleSubmit,
  };
}