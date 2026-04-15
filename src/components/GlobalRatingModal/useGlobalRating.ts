import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

export interface Item {
  _id:      string;
  title:    string;
  status:   string;
  isRated:  boolean;
  donor?:   { _id: string; name: string };
  bookedBy?: { _id: string; name: string };
}

const AUTH_PATHS = ["/login", "/register", "/verify"];

export function useGlobalRating() {
  const pathname   = usePathname();
  const apiUrl     = process.env.NEXT_PUBLIC_API_URL!;

  const [showModal,      setShowModal]      = useState(false);
  const [selectedItem,   setSelectedItem]   = useState<Item | null>(null);
  const [rating,         setRating]         = useState(0);
  const [ratingLoading,  setRatingLoading]  = useState(false);
  const [errorMsg,       setErrorMsg]       = useState("");

  // ✅ useCallback يمنع إعادة إنشاء الدالة في كل render
  const checkPendingRatings = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || AUTH_PATHS.includes(pathname)) return;

    try {
      const res = await axios.get(`${apiUrl}/api/items/me`, {
        headers: { "x-auth-token": token },
      });

      const pending = (res.data.myRequests as Item[])?.find(
        (item) => item.status === "تم التسليم" && !item.isRated
      );

      if (pending) {
        setSelectedItem(pending);
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } catch (err) {
      console.error("خطأ في فحص التقييمات المعلقة:", err);
    }
  }, [pathname, apiUrl]); // ✅ dependencies صحيحة

  useEffect(() => {
    checkPendingRatings();
  }, [checkPendingRatings]); // ✅ الآن ESLint راضي

  const handleRate = async () => {
    if (!selectedItem || rating === 0) return;
    setErrorMsg("");

    try {
      setRatingLoading(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${apiUrl}/api/items/rate/${selectedItem._id}`,
        { rating },
        { headers: { "x-auth-token": token } }
      );

      setShowModal(false);
      setRating(0);
      setSelectedItem(null);

      // افحص إذا في غرض ثاني مش مقيّم
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
    setShowModal(false);
    setRating(0);
    setErrorMsg("");
  };

  return {
    showModal, selectedItem,
    rating, setRating,
    ratingLoading, errorMsg,
    handleRate, handleClose,
  };
}