import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axiosInstance";

const CONDITIONS = ["جديد", "مستعمل ممتاز", "مستعمل جيد"] as const;
const CITIES = ["عمان", "إربد", "الزرقاء", "العقبة"] as const;

export type Condition = typeof CONDITIONS[number];
export type Category = string;
export type City = typeof CITIES[number];

export { CONDITIONS, CITIES };

interface FormData {
  title: string;
  description: string;
  category: string;
  location: string;
  condition: string;
  hubId: string;
}

interface Message {
  text: string;
  type: "success" | "error" | "";
}

export function useEditItem(itemId: string) {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    location: "",
    condition: "",
    hubId: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<Message>({ text: "", type: "" });

  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/items/${itemId}`);
        const item = data.item ?? data;

        setFormData({
          title: item.title ?? "",
          description: item.description ?? "",
          category: item.category ?? "",
          location: item.location ?? "",
          condition: item.condition ?? "",
          hubId: item.safeHub?._id ?? item.safeHub ?? "",
        });

        if (item.imageUrl) {
          setPreview(item.imageUrl);
        }
      } catch {
        setMessage({ text: "حدث خطأ في تحميل بيانات الغرض", type: "error" });
      } finally {
        setFetching(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleImageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleHubChange = useCallback((hubId: string) => {
    setFormData((prev) => ({ ...prev, hubId }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage({ text: "", type: "" });

      try {
        const fd = new FormData();
        fd.append("title", formData.title);
        fd.append("description", formData.description);
        fd.append("category", formData.category);
        fd.append("location", formData.location);
        fd.append("condition", formData.condition);

        if (formData.hubId) fd.append("safeHub", formData.hubId);
        if (imageFile) fd.append("image", imageFile);

        await axiosInstance.put(`/api/items/${itemId}`, fd);

        setMessage({ text: "تم تحديث الغرض بنجاح ✅", type: "success" });
        setTimeout(() => router.push("/dashboard"), 1200);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "حدث خطأ أثناء التعديل";
        setMessage({ text: msg, type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [formData, imageFile, itemId, router]
  );

  return {
    formData,
    preview,
    loading,
    fetching,
    message,
    handleChange,
    handleImageChange,
    handleSubmit,
    handleHubChange,
    CONDITIONS,
    CITIES,
  };
}