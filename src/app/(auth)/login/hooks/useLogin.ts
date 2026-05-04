"use client";

import { useState } from "react";
import axios from "axios";

interface FormData {
  email:    string;
  password: string;
}

export function useLogin() {
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

      // ✅ كتابة الـ Cookie بشكل يضمن قراءته من الـ middleware
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `token=${token}; path=/; expires=${expires}; SameSite=Lax`;

      // ✅ بيانات المستخدم للـ Navbar
      localStorage.setItem("user", JSON.stringify({
        id:    user._id || user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      }));

      // ✅ full page reload — يضمن أن الـ middleware يقرأ الـ Cookie الجديد
      window.location.href = "/browse";

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.needsVerification) {
          setError("حسابك غير مفعل! جاري تحويلك لصفحة التفعيل... ⏳");
          setTimeout(() => {
            window.location.href = `/verify?email=${formData.email}`;
          }, 2000);
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