"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter }                      from "next/navigation";
import { getItemById, bookItem, cancelBooking }      from "@/lib/api/itemApi";
import { Item }                                      from "@/types/item.types";
import { useAuth }                                   from "@/context/AuthContext";
import axios                                         from "axios";

const getId = (field: unknown): string | null => {
  if (!field) return null;
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null && "_id" in field) {
    return String((field as { _id: unknown })._id);
  }
  return null;
};

interface ConfirmModalState {
  show:      boolean;
  msg:       string;
  isDanger:  boolean;
  onConfirm: () => void;
}

export function useItemDetails() {
  const { id }   = useParams();
  const router   = useRouter();
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();

  const [item,          setItem]          = useState<Item | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [message,       setMessage]       = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal,  setConfirmModal]  = useState<ConfirmModalState>({
    show: false, msg: "", isDanger: false, onConfirm: () => {},
  });

  // ✅ FIX [UX-01]: مرجع للـ timer لمنع تسريب الذاكرة عند unmount
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUserId     = user?._id ?? null;
  const isDonor           = !!currentUserId && getId(item?.donor)    === currentUserId;
  const isBooker          = !!currentUserId && getId(item?.bookedBy) === currentUserId;

  // ✅ [FIX-WAITLIST-BTN]: اقرأ isInWaitlist من الـ API أولاً
  // الباك-إند لا يُرجع item.waitlist للمستخدم العادي — فـ .some() كان يرجع false دائماً بعد الريفرش
  // الحل: item.isInWaitlist هي القيمة الصحيحة من الـ DTO، مع .some() كـ fallback لمشاهدة المتبرع
  const isWaitlisted      = !!currentUserId && (
    !!item?.isInWaitlist ||
    !!item?.waitlist?.some((w) => getId(w.user) === currentUserId)
  );

  const isCancelledBefore = !!currentUserId && !!item?.cancelledBy?.some(
    (uid: string) => getId(uid) === currentUserId
  );

  // ✅ FIX [UX-01]: رسائل تختفي تلقائياً بعد 5 ثوانٍ
  const setTimedMessage = useCallback((msg: { type: string; text: string }) => {
    setMessage(msg);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(
      () => setMessage({ type: "", text: "" }),
      5000
    );
  }, []);

  // تنظيف الـ timer عند unmount
  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  const fetchItem = useCallback(async (isMounted = true, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
      const data   = await getItemById(itemId);
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

  // ─── دالة حجز الغرض ────────────────────────────────────────────────────────
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
      show:     true,
      msg:      modalMsg,
      isDanger: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        setActionLoading(true);
        try {
          const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
          const res    = await bookItem(itemId);

          // ✅ FIX [TYPE-01]: معالجة استجابة waitlisted بشكل صريح
          if (res.waitlisted) {
            // ✅ [FIX-WAITLIST-BTN]: Optimistic Update — ضع isInWaitlist: true فوراً
            // حتى قبل الريفرش يظهر زر الانسحاب مباشرة
            setItem((prev) => {
              if (!prev || !currentUserId) return prev;
              const alreadyIn = prev.isInWaitlist ||
                prev.waitlist?.some((w) => getId(w.user) === currentUserId);
              if (alreadyIn) return prev;
              return {
                ...prev,
                isInWaitlist:  true,
                waitlistCount: (prev.waitlistCount ?? 0) + 1,
                waitlist: [
                  ...(prev.waitlist ?? []),
                  {
                    user:     {
                      _id:    currentUserId,
                      name:   user?.name ?? "",
                      avatar: user?.avatar,
                    },
                    joinedAt: new Date().toISOString(),
                  },
                ],
              };
            });

            setTimedMessage({
              type: "success",
              text: res.msg ?? `✅ تمت إضافتك لقائمة الانتظار (المركز ${res.position})`,
            });

          } else {
            // حجز فعلي — اجلب من الـ API لتحديث كامل
            setTimedMessage({
              type: "success",
              text: res.msg ?? "تم حجز الغرض بنجاح ✅",
            });

            const updatedItem = await fetchItem(true, true);
            if (updatedItem) {
              setItem(updatedItem);
            } else if (currentUserId && user) {
              setItem((prev) =>
                prev
                  ? {
                      ...prev,
                      status:   "محجوز",
                      bookedBy: {
                        _id:    currentUserId,
                        name:   user.name || "المستلم",
                        avatar: user.avatar,
                      },
                    }
                  : null
              );
            }
          }
        } catch (error: unknown) {
          const msg = axios.isAxiosError(error)
            ? error.response?.data?.msg ?? "حدث خطأ أثناء الطلب"
            : "حدث خطأ أثناء الطلب";
          setTimedMessage({ type: "error", text: msg });
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [
    authLoading, isLoggedIn, id, router, fetchItem,
    item?.status, item?.waitlistCount,
    currentUserId, user, setTimedMessage,
  ]);

  // ─── دالة إلغاء الحجز ──────────────────────────────────────────────────────
  const handleCancelAction = useCallback(() => {
    const isDanger   = isBooker || isDonor;
    const confirmMsg = isBooker
      ? "⚠️ تنبيه: إلغاء الحجز سيمنعك من حجز هذه القطعة مجدداً للأبد!\nهل أنت متأكد؟"
      : isDonor
      ? "هل تريد إلغاء حجز المستلم وتمرير الدور؟"
      : "هل تريد الانسحاب من قائمة الانتظار؟";

    setConfirmModal({
      show:     true,
      msg:      confirmMsg,
      isDanger,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        setActionLoading(true);
        try {
          const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
          const res    = await cancelBooking(itemId);

          setTimedMessage({ type: "success", text: res.msg ?? "تم الإلغاء بنجاح ✅" });

          const updatedItem = await fetchItem(true, true);
          if (updatedItem) {
            setItem(updatedItem);
          } else {
            // ✅ [FIX-WAITLIST-BTN]: عند الانسحاب أيضاً امسح isInWaitlist
            setItem((prev) =>
              prev ? { ...prev, status: "متاح", bookedBy: undefined, isInWaitlist: false } : null
            );
          }
        } catch (error: unknown) {
          const msg = axios.isAxiosError(error)
            ? error.response?.data?.msg ?? "حدث خطأ أثناء الإلغاء"
            : "حدث خطأ أثناء الإلغاء";
          setTimedMessage({ type: "error", text: msg });
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [id, isBooker, isDonor, fetchItem, setTimedMessage]);

  return {
    item, loading, message,
    setMessage: setTimedMessage,
    actionLoading, currentUserId,
    isDonor, isBooker, isWaitlisted, isCancelledBefore,
    confirmModal, setConfirmModal,
    handleRequestItem, handleCancelAction, fetchItem,
  };
}
