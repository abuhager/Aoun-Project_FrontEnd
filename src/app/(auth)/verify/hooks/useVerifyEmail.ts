"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance, { setAccessToken } from "@/lib/api/axiosInstance"; // ✅ استيراد دالة حفظ التوكن
import { useAuth } from "@/context/AuthContext"; // ✅ استيراد سياق المصادقة للحصول على setUser

export function useVerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  
  // ✅ جلب دالة تعيين المستخدم لتسجيل الدخول الفوري
  const { setUser } = useAuth(); 

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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

      // ✅ التقاط استجابة الخادم للاستفادة من بيانات الجلسة الممررة
      const res = await axiosInstance.post("/api/auth/verify-email", { email, otp: otpCode });

      // ✅ التحقق الفوري: إذا أرجع الخادم accessToken - احفظه وسجل دخول المستخدم فوراً
      if (res.data?.accessToken) {
        setAccessToken(res.data.accessToken); // حفظ التوكن في الـ Instance وفي الذاكرة
        setUser(res.data.user);              // تحديث حالة المستخدم في التطبيق بالكامل
        router.push("/browse");              // التوجيه المباشر للمنصة
      } else {
        // الخيار الاحتياطي في حال لم يرسل الخادم التوكن عند التفعيل
        router.push("/login?verified=true");
      }
    } catch (err: unknown) {
      // 👈 استخدام الفحص الذكي الـ Type-safe كـ any دون استيراد مكتبة axios بالكامل
      const errorObj = err as any;
      if (errorObj.isAxiosError) {
        setError(errorObj.response?.data?.msg || "حدث خطأ أثناء التحقق من الرمز ❌");
      } else {
        setError("حدث خطأ غير متوقع ❌");
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
    inputRefs,
    handleChange,
    handleKeyDown,
    handleSubmit,
  };
}