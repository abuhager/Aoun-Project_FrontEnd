"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
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
const res = await axiosInstance.get('/api/ratings/pending'); // 
      if (res.data?.pendingRating) {
        setSelectedItem(res.data.pendingRating);
        setShowModal(true);
      } else {
        setShowModal(false);
        setSelectedItem(null);
      }
    } catch {
      setShowModal(false);
      setSelectedItem(null);
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

  useEffect(() => {
    if (!showModal) return;
    if (BLOCKED_FROM_CHECK.some((p) => pathname.startsWith(p))) return;

    router.replace(pathname, { scroll: false });
  }, [pathname, showModal, router]);

  const handleRate = async () => {
    if (!selectedItem || rating === 0) {
      setErrorMsg("اختر تقييم أولاً ⭐");
      return;
    }

    setErrorMsg("");
    setRatingLoading(true);

    try {
      // ✅ الـ endpoint الصحيح + تحويل 5 نجوم → 10 نقاط
      await axiosInstance.post(`/api/ratings`, {
        itemId: selectedItem._id,
        score:  rating * 2,
      });

      resetRatingState();
      await checkPendingRatings();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.msg || "حدث خطأ أثناء التقييم ❌");
      } else {
        setErrorMsg("حدث خطأ أثناء التقييم ❌");
      }
    } finally {
      setRatingLoading(false);
    }
  };

  const handleClose = () => {
    setErrorMsg("يجب تقييم المتبرع أولاً قبل المتابعة 🌟");
  };

  return {
    showModal,
    selectedItem,
    rating,
    setRating,
    ratingLoading,
    errorMsg,
    handleRate,
    handleClose,
  };
}