"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import axiosInstance, { getAccessToken } from "@/lib/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";

export interface Item {
  _id: string;
  title: string;
  status: string;
  isRated: boolean;
  donor?: { _id: string; name: string };
  bookedBy?: { _id: string; name: string };
}

const BLOCKED_FROM_CHECK = ["/login", "/register", "/verify"];

export function useGlobalRating() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const resetRatingState = useCallback(() => {
    setShowModal(false);
    setSelectedItem(null);
    setRating(0);
    setRatingLoading(false);
    setErrorMsg("");
  }, []);

  const checkPendingRatings = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      resetRatingState();
      return;
    }

    if (BLOCKED_FROM_CHECK.some((p) => pathname.startsWith(p))) {
      return;
    }

    try {
      const res = await axiosInstance.get("/api/ratings/pending");
      const item = res.data?.pendingRating;

      if (item && item._id) {
        setSelectedItem(item);
        setShowModal(true);
      } else {
        resetRatingState();
      }
    } catch {
      resetRatingState();
    }
  }, [pathname, resetRatingState]);

  useEffect(() => {
    if (!user) {
      resetRatingState();
    }
  }, [user, resetRatingState]);

  useEffect(() => {
    if (isLoading) return;
    if (!user?._id) return;
    if (BLOCKED_FROM_CHECK.some((p) => pathname.startsWith(p))) return;

    void checkPendingRatings();
  }, [isLoading, pathname, user?._id, checkPendingRatings]);

  const handleRate = async () => {
  if (!selectedItem?._id) {
    setErrorMsg("تعذر تحديد الغرض المراد تقييمه، أعد تحميل الصفحة");
    return;
  }

  if (rating === 0) {
    setErrorMsg("اختر تقييم أولاً ⭐");
    return;
  }

  setErrorMsg("");
  setRatingLoading(true);

  try {
    await axiosInstance.post("/api/ratings", {
      itemId: selectedItem._id,
      score: rating * 2,
    });

    // 🎯 1. إغلاق النافذة وإعادة ضبط الحالة فوراً للمستخدم
    resetRatingState();

    // 🎯 2. انتظر 500ms حتى تكتمل عملية الحفظ في قاعدة البيانات ثم افحص الأغراض المتبقية
    setTimeout(() => {
      void checkPendingRatings();
    }, 500);

  } catch (err) {
    if (axios.isAxiosError(err)) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || err.response?.data?.msg;

      // إذا كان التقييم قد أُرسل بالفعل مسبقاً، أغلق المودال ولا تكرر المطالبة
      if (code === "ALREADY_RATED" || err.response?.status === 409) {
        resetRatingState();
        setTimeout(() => {
          void checkPendingRatings();
        }, 500);
        return;
      }

      setErrorMsg(msg || "حدث خطأ أثناء التقييم ❌");
    } else {
      setErrorMsg("حدث خطأ أثناء التقييم ❌");
    }
  } finally {
    setRatingLoading(false);
  }
};

  return {
    showModal,
    selectedItem,
    rating,
    setRating,
    ratingLoading,
    errorMsg,
    handleRate,
  };
}