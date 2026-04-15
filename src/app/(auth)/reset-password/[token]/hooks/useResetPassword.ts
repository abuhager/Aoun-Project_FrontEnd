import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

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
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password/${token}`,
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
        setError(err.response?.data?.msg || "الرابط غير صالح أو انتهت صلاحيته.");
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