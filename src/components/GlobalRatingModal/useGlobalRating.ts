import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

export interface Item {
  _id:     string;
  title:   string;
  status:  string;
  isRated: boolean;
  donor?:  { _id: string; name: string };
  bookedBy?: { _id: string; name: string };
}

// الصفحات المسموح بالتنقل إليها حتى لو في تقييم معلق
const ALLOWED_PATHS = ["/login", "/register", "/verify", "/"];

export function useGlobalRating() {
  const pathname = usePathname();
  const router   = useRouter();
  const apiUrl   = process.env.NEXT_PUBLIC_API_URL!;

  const [showModal,     setShowModal]     = useState(false);
  const [selectedItem,  setSelectedItem]  = useState<Item | null>(null);
  const [rating,        setRating]        = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [errorMsg,      setErrorMsg]      = useState("");

  const checkPendingRatings = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token || ALLOWED_PATHS.some((p) => pathname.startsWith(p))) return;

    try {
      const res = await axios.get(`${apiUrl}/api/items/pending-rating`, {
        headers: { "x-auth-token": token },
      });

      if (res.data.hasPending) {
        setSelectedItem(res.data.item);
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } catch (err) {
      console.error("خطأ في فحص التقييمات المعلقة:", err);
    }
  }, [pathname, apiUrl]);

  // ─── فحص عند كل تغيير في الصفحة ───
  useEffect(() => {
    const timer = setTimeout(() => checkPendingRatings(), 500);
    return () => clearTimeout(timer);
  }, [checkPendingRatings]);

  // ─── منع التنقل إذا في تقييم معلق ───
  useEffect(() => {
    if (!showModal) return;
    if (ALLOWED_PATHS.some((p) => pathname.startsWith(p))) return;

    // إرجاع المستخدم للصفحة الحالية إذا حاول يتنقل
    router.replace(pathname);
  }, [pathname, showModal, router]);

  const handleRate = async () => {
    if (!selectedItem || rating === 0) return;
    setErrorMsg("");

    try {
      setRatingLoading(true);
      const token = Cookies.get("token");

      await axios.put(
        `${apiUrl}/api/items/rate/${selectedItem._id}`,
        { rating },
        { headers: { "x-auth-token": token } }
      );

      setShowModal(false);
      setRating(0);
      setSelectedItem(null);

      // فحص إذا في تقييم ثاني
      checkPendingRatings();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.msg || "حدث خطأ أثناء التقييم ❌");
      }
    } finally {
      setRatingLoading(false);
    }
  };

  const handleClose = () => {
    // ✅ لا يُغلق الـ Modal — المستخدم مجبر على التقييم
    setErrorMsg("يجب تقييم المتبرع أولاً قبل المتابعة 🌟");
  };

  return {
    showModal, selectedItem,
    rating,        setRating,
    ratingLoading, errorMsg,
    handleRate,    handleClose,
  };
}