"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { getSafeRedirectPath } from "@/config/routes";
import { login } from "@/lib/api/authApi";

interface FormData {
  email:    string;
  password: string;
}

interface ErrorResponse {
  msg?:   string;
  code?:  string;
  email?: string;
}

export function useLogin() {
  const router      = useRouter();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setFormData({ email, password });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await login({
        email:    formData.email,
        password: formData.password,
      });

      setUser(response.user);

      const params   = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");

      window.location.replace(getSafeRedirectPath(redirect));
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorResponse>(err)) {
        const errorData = err.response?.data;

        // ✅ إصلاح #1: الـ code الصحيح هو 'EMAIL_NOT_VERIFIED' وليس 'NOT_VERIFIED'
        if (errorData?.code === "EMAIL_NOT_VERIFIED") {
          const targetEmail = errorData.email || formData.email;
          router.push(`/verify?email=${encodeURIComponent(targetEmail)}`);
          return;
        }

        setError(errorData?.msg || "حدث خطأ غير متوقع");
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit,
    fillDemoCredentials,
  };
}
