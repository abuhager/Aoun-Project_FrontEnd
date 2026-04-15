import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ─── التحقق من تطابق كلمتي المرور ───
    if (formData.password !== formData.confirmPassword) {
      return setError("كلمات المرور غير متطابقة! 🛑");
    }

    try {
      setLoading(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        name:     formData.name,
        email:    formData.email,
        phone:    "962" + formData.phone,
        password: formData.password,
      });

      setSuccess("تم إنشاء الحساب بنجاح! جاري تحويلك للتفعيل... ⏳");
      router.push(`/verify?email=${formData.email}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "حدث خطأ أثناء إنشاء الحساب ❌");
      } else {
        setError("حدث خطأ غير متوقع ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, success, handleChange, handleSubmit };
}