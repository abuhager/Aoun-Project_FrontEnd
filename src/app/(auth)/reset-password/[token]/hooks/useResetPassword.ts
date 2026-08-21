import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/api/axiosInstance";

export function useResetPassword() {
  const { token } = useParams();
  const router    = useRouter();

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message,         setMessage]         = useState("");
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [isSuccess,       setIsSuccess]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // ─── فحص أولي قبل إرسال الطلب ───
    if (password !== confirmPassword) {
      return setError("كلمتا المرور غير متطابقتين ❌");
    }
    if (password.length < 6) {
      return setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل 🔒");
    }

    try {
      setLoading(true);
      const tokenValue = Array.isArray(token) ? token[0] : token;
      const res = await axiosInstance.post(
        `/api/auth/reset-password/${encodeURIComponent(tokenValue ?? "")}`,
        { password }
      );

      // ─── تنظيف أمني: مسح البيانات القديمة ───
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Cookies.remove("token");

      setMessage(res.data.msg);
      setIsSuccess(true);

      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { msg?: string; message?: string } | undefined;
        setError(data?.message || data?.msg || "الرابط غير صالح أو انتهت صلاحيته.");
      } else {
        setError("حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── الزر معطّل إذا الشروط ما اتحققت ───
  const isDisabled =
    loading || !password || !confirmPassword || password !== confirmPassword;

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  return {
    password,        setPassword,
    confirmPassword, setConfirmPassword,
    message, error, loading, isSuccess, isDisabled, passwordsMatch,
    handleSubmit,
  };
}
