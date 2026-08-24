"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSafeRedirectPath } from "@/config/routes";
import { login } from "@/lib/api/authApi";
import { normalizeApiError } from "@/lib/api/apiError";

interface FormData {
  email:    string;
  password: string;
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
      const apiError = normalizeApiError(err, "حدث خطأ غير متوقع");

      if (apiError.code === "EMAIL_NOT_VERIFIED") {
        router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      setError(apiError.message);
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
