"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter }             from "next/navigation";
import { getItemById, bookItem, cancelBooking } from "@/lib/api/itemApi";
import { Item }                             from "@/types/item.types";
import { useAuth }                          from "@/context/AuthContext";
import axios                                from "axios";

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
  const [loading,       setLoading]       = useState(true); // الـ Loading الأولية فقط
  const [message,       setMessage]       = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal,  setConfirmModal]  = useState<ConfirmModalState>({
    show: false, msg: "", isDanger: false, onConfirm: () => {},
  });

  const currentUserId     = user?._id ?? null;
  const isDonor           = !!currentUserId && getId(item?.donor)    === currentUserId;
  const isBooker          = !!currentUserId && getId(item?.bookedBy) === currentUserId;
  const isWaitlisted      = !!currentUserId && !!item?.waitlist?.some((w) => getId(w.user) === currentUserId);
  const isCancelledBefore = !!currentUserId && !!item?.cancelledBy?.some((uid: string) => getId(uid) === currentUserId);

  // 🌟 تعديل دالة جلب البيانات: أضفنا متغير silent لمنع وميض الشاشة والتعليق عند التحديث الخلفي
  const fetchItem = useCallback(async (isMounted = true, silent = false) => {
    try {
      if (!silent) setLoading(true); // لا تفعل الـ Loading العام إذا كان الطلب صامتاً خلف الكواليس
      const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
      const data = await getItemById(itemId);
      if (isMounted) setItem(data);
      return data;
    } catch (err) {
      if (isMounted) setMessage({ type: "error", text: "حدث خطأ أثناء تحميل بيانات الطلب" });
      return null;
    } finally {
      if (isMounted && !silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    fetchItem(isMounted, false); // أول جلب يكون طبيعي مع شاشة التحميل
    return () => { isMounted = false; };
  }, [fetchItem]);

  // ─── دالة حجز الغرض ───────────────────────────────────────────
  const handleRequestItem = useCallback(async () => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.push(`/login?redirect=/items/${id}`);
      return;
    }
    setConfirmModal({
      show:     true,
      msg:      item?.status === "متاح"
        ? "هل تريد حجز هذا الغرض؟ ستحتاج للتوجه إلى مركز التسليم وتأكيد الاستلام."
        : "هل تريد الانضمام لقائمة الانتظار؟",
      isDanger: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        setActionLoading(true);
        try {
          const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
          const res    = await bookItem(itemId);
          
          setMessage({ type: "success", text: res.msg ?? "تم طلبك بنجاح" });

          // جلب صامت تحديثي للداتابيز بدون تخريب الـ States
          const updatedItem = await fetchItem(true, true); 

          if (updatedItem) {
            setItem(updatedItem);
          } else if (currentUserId && user) {
            // 🌟 تطابق كامل مع الـ Type المعرّف للحاجز كـ Object
            setItem((prev) => prev ? { 
              ...prev, 
              status: "محجوز", 
              bookedBy: { _id: currentUserId, name: user.name || "المستلم", avatar: user.avatar } 
            } : null);
          }

        } catch (error: unknown) {
          const msg = axios.isAxiosError(error)
            ? error.response?.data?.msg ?? "حدث خطأ أثناء الطلب"
            : "حدث خطأ أثناء الطلب";
          setMessage({ type: "error", text: msg });
        } finally {
          setActionLoading(false); 
        }
      },
    });
  }, [authLoading, isLoggedIn, id, router, fetchItem, item?.status, currentUserId, user]);

  // ─── دالة إلغاء الحجز المعدلة والمحمية بالـ Types ──────────────────────────
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
          
          setMessage({ type: "success", text: res.msg ?? "تم الإلغاء بنجاح" });
          
          const updatedItem = await fetchItem(true, true);
          
          if (updatedItem) {
            setItem(updatedItem);
          } else {
            setItem((prev) => prev ? { ...prev, status: "متاح", bookedBy: undefined } : null);
          }
        } catch (error: unknown) {
          const msg = axios.isAxiosError(error)
            ? error.response?.data?.msg ?? "حدث خطأ أثناء الإلغاء"
            : "حدث خطأ أثناء الإلغاء";
          setMessage({ type: "error", text: msg });
        } finally {
          setActionLoading(false); 
        }
      },
    });
  }, [id, isBooker, isDonor, fetchItem]);
  return {
    item, loading, message, setMessage,
    actionLoading, currentUserId,
    isDonor, isBooker, isWaitlisted, isCancelledBefore,
    confirmModal, setConfirmModal,
    handleRequestItem, handleCancelAction, fetchItem,
  };
}