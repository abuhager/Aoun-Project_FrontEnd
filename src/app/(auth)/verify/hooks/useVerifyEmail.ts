// src/app/(auth)/verify/hooks/useVerifyEmail.ts
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { verifyOtp, resendOtp } from "@/lib/api/authApi";

type OtpErrorCode =
  | "OTP_ATTEMPTS_EXCEEDED"
  | "OTP_EXPIRED"
  | "RESEND_TOO_FAST"
  | string;

interface ApiErrorShape {
  response?: {
    data?: { msg?: string; code?: OtpErrorCode };
    status?: number;
  };
  isAxiosError?: boolean;
}

const COOLDOWN_SECONDS = 60;
const OTP_LENGTH       = 6;

export function useVerifyEmail() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email");
  const { setUser }  = useAuth();

  const [otp,          setOtp]          = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [shouldResend, setShouldResend] = useState(false);
  const [cooldown,     setCooldown]     = useState(0);
  const [resending,    setResending]    = useState(false);
  const [resendMsg,    setResendMsg]    = useState("");

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs   = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Cooldown ─────────────────────────────────────────────────
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

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // ─── إعادة ضبط الخانات ────────────────────────────────────────
  const resetOtpInputs = useCallback(() => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, []);

  // ─── handleChange (خانة واحدة) ────────────────────────────────
  const handleChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const value     = e.target.value.replace(/\D/g, "");
      const digit     = value.slice(-1);
      const newOtp    = [...otp];
      newOtp[index]   = digit;
      setOtp(newOtp);
      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  // ─── handleKeyDown ────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  // ─── ✅ handlePaste — يوزّع الأرقام على كل الخانات ────────────
  // يعمل سواء لصق من أول خانة أو من أي خانة وسط
  const handlePaste = useCallback(
    (startIndex: number, e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      // نأخذ فقط الأرقام من النص الملصوق
      const pasted      = e.clipboardData.getData("text/plain");
      const digitsOnly  = pasted.replace(/\D/g, "").slice(0, OTP_LENGTH);

      if (!digitsOnly) return;

      // نبني مصفوفة OTP جديدة
      const newOtp = [...otp];
      for (let i = 0; i < digitsOnly.length; i++) {
        const targetIndex = startIndex + i;
        if (targetIndex < OTP_LENGTH) {
          newOtp[targetIndex] = digitsOnly[i];
        }
      }
      setOtp(newOtp);

      // ننقل التركيز لأول خانة فارغة، أو الأخيرة إذا امتلأت كلها
      const firstEmptyAfterPaste = newOtp.findIndex((d) => d === "");
      const focusTarget =
        firstEmptyAfterPaste === -1 ? OTP_LENGTH - 1 : firstEmptyAfterPaste;
      setTimeout(() => inputRefs.current[focusTarget]?.focus(), 0);
    },
    [otp]
  );

  // ─── handleSubmit ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) { setError("لا يوجد بريد إلكتروني للتحقق"); return; }

    const otpCode = otp.join("");
    if (otpCode.length !== OTP_LENGTH) {
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

  // ─── handleResend ─────────────────────────────────────────────
  const handleResend = useCallback(async () => {
    if (!email || cooldown > 0 || resending) return;

    try {
      setResending(true);
      setResendMsg("");

      await resendOtp({ email });

      setResendMsg("✅ تم إرسال رمز جديد إلى بريدك 📧");
      setShouldResend(false);
      resetOtpInputs();
      startCooldown();
    } catch (err: unknown) {
      const axiosErr = err as ApiErrorShape;
      const code     = axiosErr?.response?.data?.code;
      const msg      = axiosErr?.response?.data?.msg ?? "فشل الإرسال، حاول بعد قليل ⚠️";
      setResendMsg(msg);
      if (code === "RESEND_TOO_FAST") startCooldown();
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
    cooldown,
    resending,
    resendMsg,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,   // ✅ مُصدَّر جديد
    handleSubmit,
    handleResend,
  };
}