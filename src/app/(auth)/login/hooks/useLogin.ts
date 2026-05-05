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

      // ── 1. حفظ الـ token في cookie يقرأه الـ proxy على الـ Edge ──
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `token=${token}; path=/; expires=${expires}; SameSite=Lax`;

      // ── 2. حفظ الـ token في الذاكرة للـ axiosInstance interceptor ──
      setAccessToken(token);

      // ── 3. بيانات المستخدم للـ Navbar ──────────────────────────────
      localStorage.setItem("user", JSON.stringify({
        id:    user._id ?? user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        trustLevel: user.trustLevel ?? 1,
      }));

      // ── 4. توجيه للـ dashboard (أو الصفحة المطلوبة قبل الـ login) ──
      const params  = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/dashboard';
      window.location.href = redirect;

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.needsVerification) {
          setError("حسابك غير مفعل! جاري تحويلك لصفحة التفعيل... ⏳");
          setTimeout(() => {
            window.location.href = `/verify?email=${formData.email}`;
          }, 2000);
        } else {
          setError(
            err.response?.data?.msg ?? "البريد الإلكتروني أو كلمة المرور غير صحيحة ❌"
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
