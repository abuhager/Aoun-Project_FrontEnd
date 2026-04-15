import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export function useVerifyEmail() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email");

  const [otp,     setOtp]     = useState<string[]>(["", "", "", ""]);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Refs للتنقل بين الخانات ───
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // ─── انتقل للخانة التالية تلقائياً ───
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // ─── عند Backspace ارجع للخانة السابقة ───
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      setError("الرجاء إدخال الرمز المكون من 4 أرقام 🛑");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`,
        { email, otp: otpCode }
      );
      router.push("/login?verified=true");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "حدث خطأ أثناء التحقق من الرمز ❌");
      } else {
        setError("حدث خطأ غير متوقع ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return {
    email, otp, error, loading, isComplete,
    inputRefs, handleChange, handleKeyDown, handleSubmit,
  };
}