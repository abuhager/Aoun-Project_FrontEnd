"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

interface FormData {
  email:    string;
  password: string;
}

export function useLogin() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email: formData.email, password: formData.password }
      );

      const { token, user } = res.data;

      // ✅ Token يُحفظ فقط في Cookie (أكثر أمناً من localStorage ضد XSS)
      // ⚠️ localStorage.setItem("token") محذوف — كان خطر أمني
      Cookies.set("token", token, {
        expires:  7,
        sameSite: "lax",
        // secure: true  // ← فعّله عند الـ production (HTTPS فقط)
      });

      // ✅ بيانات المستخدم العامة فقط (بدون token) للـ Navbar
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/browse");

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.needsVerification) {
          setError("حسابك غير مفعل! جاري تحويلك لصفحة التفعيل... ⏳");
          setTimeout(() => router.push(`/verify?email=${formData.email}`), 2000);
        } else {
          setError(
            err.response?.data?.msg || "البريد الإلكتروني أو كلمة المرور غير صحيحة ❌"
          );
        }
      } else {
        setError("حدث خطأ غير متوقع ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, handleChange, handleSubmit };
}