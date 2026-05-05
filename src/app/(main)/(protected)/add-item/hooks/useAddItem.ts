import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axiosInstance";
import axios from "axios";

interface FormData {
  title:       string;
  description: string;
  category:    string;
  location:    string;
  condition:   string;
}

interface Message {
  type: "success" | "error" | "";
  text: string;
}

export function useAddItem() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: "", description: "", category: "",
    location: "", condition: "مستعمل ممتاز",
  });
  const [image,   setImage]   = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>({ type: "", text: "" });

  // ✅ الحماية تتم عبر proxy.ts — لا نحتاج Cookies هنا

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "حجم الصورة كبير جداً، الحد الأقصى 5 ميجا" });
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) {
      return setMessage({ type: "error", text: "الرجاء اختيار صورة للقطعة" });
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const data = new FormData();
    data.append("title",       formData.title);
    data.append("description", formData.description);
    data.append("category",    formData.category);
    data.append("location",    formData.location);
    data.append("condition",   formData.condition);
    data.append("image",       image);

    try {
      // ✅ axiosInstance يرفق Token تلقائياً + baseURL مضبوط
      await axiosInstance.post("/api/items", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage({ type: "success", text: "تم نشر التبرع بنجاح! جاري تحويلك..." });
      setTimeout(() => router.push("/browse"), 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage({ type: "error", text: err.response?.data?.msg || "فشل في إضافة التبرع" });
      } else {
        setMessage({ type: "error", text: "حدث خطأ غير متوقع" });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData, image, preview, loading, message,
    handleChange, handleImageChange, handleSubmit,
  };
}
