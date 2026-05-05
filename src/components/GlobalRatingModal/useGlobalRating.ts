import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import axiosInstance, { getAccessToken } from "@/lib/api/axiosInstance";

export interface Item {
  _id:     string;
  title:   string;
  status:  string;
  isRated: boolean;
  donor?:  { _id: string; name: string };
  bookedBy?: { _id: string; name: string };
}

// الصفحات المسموح بالتنقل إليها حتى لو في تقييم معلق
const BLOCKED_FROM_CHECK = ["/login", "/register", "/verify"];

export function useGlobalRating() {
  const pathname = usePathname();
  const router   = useRouter();

  const [showModal,     setShowModal]     = useState(false);
  const [selectedItem,  setSelectedItem]  = useState<Item | null>(null);
  const [rating,        setRating]        = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [errorMsg,      setErrorMsg]      = useState("");

  const checkPendingRatings = useCallback(async () => {
    // ✅ FIX: استخدم getAccessToken() بدل Cookies.get('token')
    // بعد Phase 1 الـ Access Token في الذاكرة وليس في Cookie
    const token = getAccessToken();
    if (!token || BLOCKED_FROM_CHECK.some((p) => pathname.startsWith(p))) return;

    try {
      // ✅ FIX: axiosInstance ترفق التوكن تلقائياً + تتعامل مع الـ 401
      const res = await axiosInstance.get("/api/items/pending-rating");

      if (res.data.hasPending) {
        setSelectedItem(res.data.item);
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } catch (err) {
      // صامت — الـ interceptor يتعامل مع 401 تلقائياً
      // لا نريد أخطاء console مزعجة للمستخدم أو في Dev Tools
      void err;
    }
  }, [pathname]);

  // ─── فحص عند كل تغيير في الصفحة ───
  useEffect(() => {
    const timer = setTimeout(() => checkPendingRatings(), 500);
    return () => clearTimeout(timer);
  }, [checkPendingRatings]);

  // ─── منع التنقل إذا في تقييم معلق ───
  useEffect(() => {
    if (!showModal) return;
    if (BLOCKED_FROM_CHECK.some((p) => pathname.startsWith(p))) return;
    router.replace(pathname);
  }, [pathname, showModal, router]);

  const handleRate = async () => {
    if (!selectedItem || rating === 0) return;
    setErrorMsg("");

    try {
      setRatingLoading(true);
      // ✅ axiosInstance ترفق التوكن تلقائياً
      await axiosInstance.put(
        `/api/items/rate/${selectedItem._id}`,
        { rating }
      );

      setShowModal(false);
      setRating(0);
      setSelectedItem(null);
      checkPendingRatings();
    } catch (err) {
      import("axios").then(({ default: axios }) => {
        if (axios.isAxiosError(err)) {
          setErrorMsg(err.response?.data?.msg || "حدث خطأ أثناء التقييم ❌");
        }
      });
    } finally {
      setRatingLoading(false);
    }
  };

  const handleClose = () => {
    setErrorMsg("يجب تقييم المتبرع أولاً قبل المتابعة 🌟");
  };

  return {
    showModal, selectedItem,
    rating,        setRating,
    ratingLoading, errorMsg,
    handleRate,    handleClose,
  };
}
