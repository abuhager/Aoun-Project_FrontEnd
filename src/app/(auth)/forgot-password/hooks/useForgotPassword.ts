import { useState } from "react";
import axios from "axios";

const API = "https://aoun-project-backend.onrender.com/api/auth/forgot-password";

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
      const res = await axios.post(API, { email });
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