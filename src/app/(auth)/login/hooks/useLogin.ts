// src/app/(auth)/login/hooks/useLogin.ts
"use client";

import { useState } from "react";
import axiosInstance, { setAccessToken } from "@/lib/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser, UserRole } from "@/types/user.types";
// ✅ حذفنا import Cookies — لم يعد مطلوباً

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
    phone?: string;
    avatar?: string;
    role: string;
    trustScore?: number;
    trustLevel?: 1 | 2;
    quota?: number;
    isVerified?: boolean;
    isVerifiedStudent?: boolean;
    isBanned?: boolean;
    totalDonations?: number;
    badges?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
}

export function useLogin() {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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

      const { accessToken, user } = res.data;

      // ✅ Access Token في الـ Memory فقط — آمن من XSS
      setAccessToken(accessToken);

      // ✅ حذفنا Cookies.set("isLoggedIn") — الـ refreshToken httpOnly من Backend يكفي
      // ❌ Cookies.set("isLoggedIn", "1", { expires: 7, sameSite: "lax" });

     // useLogin.ts — الحقول الصحيحة فقط
const authUser: AuthUser = {
  _id:               user._id ?? user.id ?? "",
  name:              user.name,
  email:             user.email,
  avatar:            user.avatar,
  role:              user.role as UserRole,
  trustScore:        user.trustScore        ?? 0,
  trustLevel:        (user.trustLevel as 1 | 2) ?? 1,
  quota:             user.quota             ?? 0,
  isVerified:        user.isVerified        ?? false,
  isVerifiedStudent: user.isVerifiedStudent ?? false,
  createdAt:         user.createdAt         ?? "",
};

      setUser(authUser);

      const params   = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      window.location.replace(
        redirect && redirect !== "/login" ? redirect : "/browse"
      );
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { msg?: string } } };
        setError(axiosErr.response?.data?.msg ?? "حدث خطأ غير متوقع");
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  return { formData, error, loading, handleChange, handleSubmit };
}