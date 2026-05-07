"use client";

import { useState } from "react";
import axiosInstance, { setAccessToken } from "@/lib/api/axiosInstance";
import axios from "axios";

interface FormData {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  msg: string;
  user: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: string;
    isVerifiedStudent?: boolean;
  };
}

export function useLogin() {
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await axiosInstance.post<LoginResponse>("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { accessToken, user } = res.data;

      // ✅ accessToken في الذاكرة فقط
      setAccessToken(accessToken);

      // ✅ refreshToken زُرع تلقائياً من الباك كـ httpOnly cookie
      // ✅ لا localStorage، لا document.cookie

      // ✅ redirect
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      window.location.replace(
        redirect && redirect !== "/login" ? redirect : "/browse"
      );

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