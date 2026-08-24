// src/app/(auth)/register/hooks/useRegister.ts

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/authApi";
import { normalizeApiError } from "@/lib/api/apiError";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "@/lib/validation/auth";

interface FormData {
  name:            string;
  email:           string;
  phone:           string;
  password:        string;
  confirmPassword: string;
}

export function useRegister() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "", email: "", phone: "",
    password: "", confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "email") setEmailAlreadyExists(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setEmailAlreadyExists(false);

    if (formData.password !== formData.confirmPassword) {
      return setError("كلمات المرور غير متطابقة! 🛑");
    }
    if (!isStrongPassword(formData.password)) {
      return setError(PASSWORD_REQUIREMENTS_MESSAGE);
    }

    try {
      setLoading(true);
      await register({
        name:     formData.name,
        email:    formData.email,
        phone:    "+962" + formData.phone, // ✅ FIX: أضف + في البداية
        password: formData.password,
      });

      setSuccess("تم إنشاء الحساب بنجاح! جاري تحويلك للتفعيل... ⏳");
      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err: unknown) {
      const apiError = normalizeApiError(err, "حدث خطأ أثناء إنشاء الحساب ❌");
      setEmailAlreadyExists(apiError.code === "EMAIL_ALREADY_EXISTS");
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    success,
    emailAlreadyExists,
    handleChange,
    handleSubmit,
  };
}
