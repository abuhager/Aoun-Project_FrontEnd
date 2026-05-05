"use client";

import { useState } from "react";
import axiosInstance, { setAccessToken } from "@/lib/api/axiosInstance";
import axios from "axios";

interface FormData {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  msg: string;
  user: {
    _id?: string;
    id?:  string;
    name: string;
    email: string;
    role: string;
    isVerifiedStudent?: boolean;
    trustLevel?: number;
  };
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

      const res = await axiosInstance.post<LoginResponse>("/api/auth/login", {
        email:    formData.email,
        password: formData.password,
      });

      const { token, user } = res.data;

      // 1. حفظ الـ token في cookie يقرأه الـ middleware
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `token=${token}; path=/; expires=${expires}; SameSite=Lax`;

      // 2. حفظ في الذاكرة للـ axiosInstance
      setAccessToken(token);

      // 3. بيانات المستخدم
      localStorage.setItem("user", JSON.stringify({
        id:    user._id ?? user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        trustLevel: user.trustLevel ?? 1,
      }));

      // 4. توجيه — /browse آمن (ليس محمي)
      //    المستخدم يضغط dashboard بنفسه من الـ Navbar
      const params   = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      // ✅ لا ترسل للـ dashboard مباشرةً — الـ middleware قد لا يشوف الـ cookie بعد
      window.location.replace(redirect && redirect !== '/login' ? redirect : '/browse');

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.needsVerification) {
          setError("حسابك غير مفعل! جاري تحويلك لصفحة التفعيل... ⏳");
          setTimeout(() => {
            window.location.href = `/verify?email=${formData.email}`;
          }, 2000);
        } else {
          setError(err.response?.data?.msg ?? "البريد أو كلمة المرور غير صحيحة ❌");
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
