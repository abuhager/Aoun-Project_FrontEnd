"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getItemById, bookItem, cancelBooking } from "@/lib/api/itemApi";
import { Item } from "@/types/item.types";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const getId = (field: unknown): string | null => {
  if (!field) return null;
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null && "_id" in field) {
    return String((field as { _id: unknown })._id);
  }
  return null;
};

interface ConfirmModalState {
  show: boolean;
  msg: string;
  isDanger: boolean;
  onConfirm: () => void;
}

export function useItemDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false, msg: "", isDanger: false, onConfirm: () => {},
  });

  // ✅ FIX [WAITLIST-PERSIST]: Optimistic waitlist state مع localStorage
  const [optimisticWaitlist, setOptimisticWaitlist] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("aoun_waitlist_items");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const updateWaitlistStorage = useCallback((itemId: string, inWaitlist: boolean) => {
    setOptimisticWaitlist((prev) => {
      const next = new Set(prev);
      if (inWaitlist) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      try {
        // ✅ FIX [LOCALSTORAGE-TTL]: حذف IDs القديمة — احتفظ بآخر 50 فقط
        const arr = [...next].slice(-50);
        localStorage.setItem("aoun_waitlist_items", JSON.stringify(arr));
        return new Set(arr);
      } catch {
        return next;
      }
    });
  }, []);

  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUserId = user?._id ?? null;
  const isDonor = !!currentUserId && getId(item?.donor) === currentUserId;
  const isBooker = !!currentUserId && getId(item?.bookedBy) === currentUserId;

  const itemIdStr = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  // ✅ FIX [WAITLIST-SOURCE]: الاعتماد فقط على isInWaitlist + optimisticWaitlist
  // item?.waitlist?.some() حُذف لأنه يكون undefined دائماً في toPublicItem
  const isWaitlisted = !!currentUserId && (
    !!item?.isInWaitlist ||
    optimisticWaitlist.has(itemIdStr)
  );

  const isCancelledBefore = !!currentUserId && !!item?.cancelledBy?.some(
    (uid: string) => getId(uid) === currentUserId
  );

  const setTimedMessage = useCallback((msg: { type: string; text: string }) => {
    setMessage(msg);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(
      () => setMessage({ type: "", text: "" }),
      5000
    );
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  const fetchItem = useCallback(async (isMounted = true, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
      const data = await getItemById(itemId);
      if (isMounted) setItem(data);
      return data;
    } catch {
      if (isMounted)
        setTimedMessage({ type: "error", text: "حدث خطأ أثناء تحميل بيانات الطلب" });
      return null;
    } finally {
      if (isMounted && !silent) setLoading(false);
    }
  }, [id, setTimedMessage]);

  useEffect(() => {
    let isMounted = true;
    fetchItem(isMounted, false);
    return () => { isMounted = false; };
  }, [fetchItem]);

  // ✅ FIX [LOCALSTORAGE-CLEANUP]: تنظيف الـ localStorage عند اكتمال التسليم
  useEffect(() => {
    if (item?.status === "تم التسليم" && itemIdStr) {
      updateWaitlistStorage(itemIdStr, false);
    }
  }, [item?.status, itemIdStr, updateWaitlistStorage]);

  const handleRequestItem = useCallback(async () => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.push(`/login?redirect=/items/${id}`);
      return;
    }

    const modalMsg = item?.status === "متاح"
      ? "هل تريد حجز هذا الغرض؟ ستحتاج للتوجه إلى مركز التسليم وتأكيد الاستلام."
      : `هل تريد الانضمام لقائمة الانتظار؟ (${item?.waitlistCount ?? 0} شخص قبلك)`;

    setConfirmModal({
      show: true,
      msg: modalMsg,
      isDanger: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        setActionLoading(true);
        try {
          const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
          const res = await bookItem(itemId);

          setTimedMessage({
            type: "success",
            text: res.msg ?? "تم حجز الغرض بنجاح ✅",
          });

          // ✅ إذا كان waitlisted → احفظ في localStorage
          if (res.waitlisted) {
            updateWaitlistStorage(itemId, true);
          }

          const updatedItem = await fetchItem(true, true);
          if (updatedItem) {
            setItem(updatedItem);
          } else if (currentUserId && user && !res.waitlisted) {
            setItem((prev) =>
              prev
                ? {
                    ...prev,
                    status: "محجوز",
                    bookedBy: {
                      _id: currentUserId,
                      name: user.name || "المستلم",
                      avatar: user.avatar,
                    },
                  }
                : null
            );
          }
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            const errorCode = error.response?.data?.code;
            const errorMsg  = error.response?.data?.message;

            // ✅ إذا كان الخطأ ALREADY_WAITLISTED → احفظ في localStorage
            if (errorCode === "ALREADY_WAITLISTED" || errorMsg?.includes("قائمة الانتظار")) {
              const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
              updateWaitlistStorage(itemId, true);
              setTimedMessage({
                type: "success",
                text: "أنت مسجل في قائمة الانتظار بالفعل ✅",
              });
              return;
            }

            const msg = error.response?.data?.msg
              ?? error.response?.data?.message
              ?? "حدث خطأ أثناء الطلب";
            setTimedMessage({ type: "error", text: msg });
          } else {
            setTimedMessage({ type: "error", text: "حدث خطأ أثناء الطلب" });
          }
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [
    authLoading, isLoggedIn, id, router, fetchItem,
    item?.status, item?.waitlistCount,
    currentUserId, user, setTimedMessage, updateWaitlistStorage,
  ]);

  const handleCancelAction = useCallback(() => {
    const isDanger = isBooker || isDonor;
    const confirmMsg = isBooker
      ? "⚠️ تنبيه: إلغاء الحجز سيمنعك من حجز هذه القطعة مجدداً للأبد!\nهل أنت متأكد؟"
      : isDonor
      ? "هل تريد إلغاء حجز المستلم وتمرير الدور؟"
      : "هل تريد الانسحاب من قائمة الانتظار؟";

    setConfirmModal({
      show: true,
      msg: confirmMsg,
      isDanger,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        setActionLoading(true);
        try {
          const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
          const res = await cancelBooking(itemId);

          // ✅ احذف من localStorage عند الإلغاء
          updateWaitlistStorage(itemId, false);

          setTimedMessage({ type: "success", text: res.msg ?? "تم الإلغاء بنجاح ✅" });

          const updatedItem = await fetchItem(true, true);
          if (updatedItem) {
            setItem(updatedItem);
          } else {
            setItem((prev) =>
              prev ? { ...prev, status: "متاح", bookedBy: undefined, isInWaitlist: false } : null
            );
          }
        } catch (error: unknown) {
          const msg = axios.isAxiosError(error)
            ? error.response?.data?.msg ?? error.response?.data?.message ?? "حدث خطأ أثناء الإلغاء"
            : "حدث خطأ أثناء الإلغاء";
          setTimedMessage({ type: "error", text: msg });
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [id, isBooker, isDonor, fetchItem, setTimedMessage, updateWaitlistStorage]);

  return {
    item, loading, message,
    setMessage: setTimedMessage,
    actionLoading, currentUserId,
    isDonor, isBooker, isWaitlisted, isCancelledBefore,
    confirmModal, setConfirmModal,
    handleRequestItem, handleCancelAction, fetchItem,
  };
}