import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { getItemById, updateItem } from "@/lib/api/itemApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import type { ItemCondition } from "@/types/item.types";

const CONDITIONS = ["جديد", "مستعمل ممتاز", "مستعمل جيد"] as const;
const CITIES = ["عمان", "إربد", "الزرقاء", "العقبة"] as const;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export { CONDITIONS, CITIES };

interface EditItemForm {
  title: string;
  description: string;
  category: string;
  location: string;
  condition: ItemCondition;
  hubId: string;
}

interface Message {
  text: string;
  type: "success" | "error" | "";
}

export function useEditItem(itemId: string, hubRequired: boolean) {
  const router = useRouter();
  const [formData, setFormData] = useState<EditItemForm>({
    title: "",
    description: "",
    category: "",
    location: "",
    condition: "مستعمل ممتاز",
    hubId: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<Message>({ text: "", type: "" });
  const objectUrlRef = useRef<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!itemId) return;
    const controller = new AbortController();

    const fetchItem = async () => {
      setFetching(true);
      try {
        const item = await getItemById(itemId, controller.signal);
        if (controller.signal.aborted) return;
        setFormData({
          title: item.title ?? "",
          description: item.description ?? "",
          category: item.category ?? "",
          location: item.location ?? "",
          condition: item.condition ?? "مستعمل ممتاز",
          hubId: item.safeHub?._id ?? "",
        });
        setPreview(item.imageUrl ?? "");
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setMessage({
            text: extractErrorMsg(requestError, "حدث خطأ في تحميل بيانات الغرض"),
            type: "error",
          });
        }
      } finally {
        if (!controller.signal.aborted) setFetching(false);
      }
    };

    void fetchItem();
    return () => controller.abort();
  }, [itemId]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setFormData((previous) => ({ ...previous, [name]: value } as EditItemForm));
    },
    []
  );

  const handleImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      event.target.value = "";
      setMessage({ text: "الصورة يجب أن تكون JPEG أو PNG أو WebP", type: "error" });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      event.target.value = "";
      setMessage({ text: "حجم الصورة كبير جداً، الحد الأقصى 5MB", type: "error" });
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setImageFile(file);
    setPreview(objectUrl);
    setMessage({ text: "", type: "" });
  }, []);

  const handleHubChange = useCallback((hubId: string) => {
    setFormData((previous) => ({ ...previous, hubId }));
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (hubRequired && !formData.hubId) {
      setMessage({ text: "الرجاء اختيار مركز التسليم", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });
    let succeeded = false;
    try {
      await updateItem(itemId, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        condition: formData.condition,
        safeHub: formData.hubId,
        image: imageFile ?? undefined,
      });
      setMessage({ text: "تم تحديث الغرض بنجاح ✅", type: "success" });
      succeeded = true;
      redirectTimerRef.current = setTimeout(() => router.push("/dashboard"), 1200);
    } catch (requestError) {
      setMessage({
        text: extractErrorMsg(requestError, "حدث خطأ أثناء التعديل"),
        type: "error",
      });
    } finally {
      if (!succeeded) setLoading(false);
    }
  }, [formData, hubRequired, imageFile, itemId, router]);

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
