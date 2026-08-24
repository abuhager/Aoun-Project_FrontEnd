// ✅ src/app/(auth)/forgot-password/hooks/useForgotPassword.ts
import { useState } from "react";
import { forgotPassword } from "@/lib/api/authApi";
import { extractErrorMsg } from "@/lib/api/apiError";

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
      const response = await forgotPassword({ email });
      setMessage(response.msg);
    } catch (err: unknown) {
      setError(extractErrorMsg(err, "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً."));
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, message, error, loading, handleSubmit };
}
