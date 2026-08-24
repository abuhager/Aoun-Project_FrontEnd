"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPendingRating, submitRating } from "@/lib/api/ratingApi";
import { normalizeApiError } from "@/lib/api/apiError";
import type {
  PendingRatingResponse,
  RatingScore,
} from "@/types/rating.types";

type PendingRatingItem = NonNullable<PendingRatingResponse["pendingRating"]>;

const BLOCKED_FROM_CHECK = [
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
];

export function useGlobalRating() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PendingRatingItem | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const checkControllerRef = useRef<AbortController | null>(null);
  const checkSequenceRef = useRef(0);

  const resetRatingState = useCallback(() => {
    setShowModal(false);
    setSelectedItem(null);
    setRating(0);
    setRatingLoading(false);
    setErrorMsg("");
  }, []);

  const checkPendingRatings = useCallback(async () => {
    if (!user?._id) {
      checkControllerRef.current?.abort();
      resetRatingState();
      return;
    }

    if (BLOCKED_FROM_CHECK.some((p) => pathname.startsWith(p))) {
      checkControllerRef.current?.abort();
      resetRatingState();
      return;
    }

    checkControllerRef.current?.abort();
    const controller = new AbortController();
    const requestId = ++checkSequenceRef.current;
    checkControllerRef.current = controller;

    try {
      const response = await getPendingRating(controller.signal);
      if (controller.signal.aborted || requestId !== checkSequenceRef.current) return;
      const item = response.pendingRating;

      if (item && item._id) {
        setSelectedItem(item);
        setShowModal(true);
      } else {
        resetRatingState();
      }
    } catch {
      if (!controller.signal.aborted && requestId === checkSequenceRef.current) {
        resetRatingState();
      }
    }
  }, [pathname, resetRatingState, user?._id]);

  useEffect(() => {
    if (!user) {
      checkControllerRef.current?.abort();
      resetRatingState();
    }
  }, [user, resetRatingState]);

  useEffect(() => {
    if (isLoading) return;
    if (!user?._id) return;

    void checkPendingRatings();
  }, [isLoading, pathname, user?._id, checkPendingRatings]);

  useEffect(() => () => {
    checkControllerRef.current?.abort();
    checkSequenceRef.current += 1;
  }, []);

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
      await submitRating({
        itemId: selectedItem._id,
        score: (rating * 2) as RatingScore,
      });

      resetRatingState();
      await checkPendingRatings();
    } catch (err) {
      const apiError = normalizeApiError(err, "حدث خطأ أثناء التقييم ❌");

      if (apiError.code === "ALREADY_RATED" || apiError.status === 409) {
        resetRatingState();
        await checkPendingRatings();
        return;
      }

      setErrorMsg(apiError.message);
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
