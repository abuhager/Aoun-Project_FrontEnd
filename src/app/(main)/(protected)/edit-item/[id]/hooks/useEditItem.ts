import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axiosInstance";
import axios from "axios";

interface FormData {
  title:       string;
  description: string;
  category:    string;
  location:    string;
  condition:   string;
}

export function useEditItem() {
  const { id } = useParams();
  const router  = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: "", description: "", category: "", location: "", condition: "",
  });
  const [image,    setImage]    = useState<File | null>(null);
  const [preview,  setPreview]  = useState("");
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      try {
        // ✅ Public GET — axiosInstance يضيف Token إن وجد
        const res = await axiosInstance.get(`/api/items/${id}`);
        const { title, description, category, location, condition, imageUrl } = res.data;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
        setFormData({ title, description, category, location, condition });
        setPreview(imageUrl.startsWith("http") ? imageUrl : `${apiUrl}/${imageUrl}`);
      } catch {
        setError("فشل في جلب بيانات الغرض 🛑");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    const data = new FormData();
    data.append("title",       formData.title);
    data.append("description", formData.description);
    data.append("category",    formData.category);
    data.append("location",    formData.location);
    data.append("condition",   formData.condition);
    if (image) data.append("image", image);

    try {
      // ✅ axiosInstance يرفق Token تلقائياً
      await axiosInstance.put(`/api/items/update/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "حدث خطأ أثناء التعديل");
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setUpdating(false);
    }
  };

  return {
    formData, preview, loading, updating, error,
    handleChange, handleImageChange, handleSubmit,
  };
}
