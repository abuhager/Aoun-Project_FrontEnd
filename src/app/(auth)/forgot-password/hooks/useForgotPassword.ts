// ✅ src/app/(auth)/forgot-password/hooks/useForgotPassword.ts
import { useState } from "react";
import axiosInstance from "@/lib/api/axiosInstance"; // ✅ استخدم المثيل المُهيَّأ
import axios from "axios";

export function useForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // ✅ لا hardcoded URL — axiosInstance يحمل baseURL من .env
      const res = await axiosInstance.post("/api/auth/forgot-password", { email });
      setMessage(res.data.msg);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
      } else {
        setError("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, message, error, loading, handleSubmit };
}