import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createItem } from "@/lib/api/itemApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import type { ItemCondition } from "@/types/item.types";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

interface AddItemForm {
  title: string;
  description: string;
  category: string;
  location: string;
  condition: ItemCondition;
  hubId: string;
}

interface Message {
  type: "success" | "error" | "";
  text: string;
}

export function useAddItem(hubRequired: boolean) {
  const router = useRouter();
  const [formData, setFormData] = useState<AddItemForm>({
    title: "",
    description: "",
    category: "",
    location: "",
    condition: "مستعمل ممتاز",
    hubId: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>({ type: "", text: "" });
  const objectUrlRef = useRef<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value } as AddItemForm));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      event.target.value = "";
      setMessage({ type: "error", text: "الصورة يجب أن تكون JPEG أو PNG أو WebP" });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      event.target.value = "";
      setMessage({ type: "error", text: "حجم الصورة كبير جداً، الحد الأقصى 5MB" });
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setImage(file);
    setPreview(objectUrl);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!image) {
      setMessage({ type: "error", text: "الرجاء اختيار صورة" });
      return;
    }
    if (hubRequired && !formData.hubId) {
      setMessage({ type: "error", text: "الرجاء اختيار مركز التسليم" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    let succeeded = false;
    try {
      await createItem({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        condition: formData.condition,
        safeHub: formData.hubId || undefined,
        image,
      });
      setMessage({ type: "success", text: "تم نشر التبرع بنجاح! جاري تحويلك..." });
      succeeded = true;
      redirectTimerRef.current = setTimeout(() => router.push("/browse"), 1200);
    } catch (requestError) {
      setMessage({
        type: "error",
        text: extractErrorMsg(requestError, "فشل في إضافة التبرع"),
      });
    } finally {
      if (!succeeded) setLoading(false);
    }
  };

  const handleHubChange = (hubId: string) => {
    setFormData((previous) => ({ ...previous, hubId }));
  };

  return {
    formData,
    image,
    preview,
    loading,
    message,
    handleChange,
    handleImageChange,
    handleSubmit,
    handleHubChange,
  };
}
