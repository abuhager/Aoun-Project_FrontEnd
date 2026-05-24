import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getItemById, bookItem, cancelBooking } from "@/lib/api/itemApi";
import { Item } from "@/types/item.types";
import { useAuth } from "@/context/AuthContext";

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
  const router  = useRouter();
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();

  const [item,          setItem]          = useState<Item | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [message,       setMessage]       = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal,  setConfirmModal]  = useState<ConfirmModalState>({
    show: false, msg: "", isDanger: false, onConfirm: () => {},
  });

  const currentUserId     = user?._id ?? null;
  const isDonor           = !!currentUserId && getId(item?.donor)     === currentUserId;
  const isBooker          = !!currentUserId && getId(item?.bookedBy)  === currentUserId;
  const isWaitlisted      = !!currentUserId && !!item?.waitlist?.some((w) => getId(w.user) === currentUserId);
  const isCancelledBefore = !!currentUserId && !!item?.cancelledBy?.some((uid) => getId(uid) === currentUserId);

  const fetchItem = useCallback(async (isMounted = true) => {
    try {
      setLoading(true);
      const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
      const data   = await getItemById(itemId);
      if (isMounted) setItem(data);
    } catch {
      if (isMounted) setMessage({ type: "error", text: "حدث خطأ أثناء تحميل بيانات الطلب" });
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    fetchItem(isMounted);
    return () => { isMounted = false; };
  }, [fetchItem]);

  const handleRequestItem = useCallback(async () => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.push(`/login?redirect=/items/${id}`);
      return;
    }
    setConfirmModal({
      show: true,
      msg: "هل تريد الانضمام لهذا الطابور؟",
      isDanger: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        setActionLoading(true);
        try {
          const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
          const res    = await bookItem(itemId);
          setMessage({ type: "success", text: res.message ?? "تم طلبك بنجاح" });
          fetchItem();
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ?? "حدث خطأ أثناء الطلب";
          setMessage({ type: "error", text: msg });
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [authLoading, isLoggedIn, id, router, fetchItem]);

  const handleCancelAction = useCallback(() => {
    const isDanger    = isBooker || isDonor;
    const confirmMsg  = isBooker
      ? "⚠️ تنبيه: إلغاء الحجز سيمنعك من حجز هذه القطعة مجدداً للأبد!\nهل أنت متأكد؟"
      : isDonor
      ? "هل تريد إلغاء حجز المستلم وتمرير الدور؟"
      : "هل تريد الانسحاب من قائمة الانتظار؟";

    setConfirmModal({
      show: true,
      msg:  confirmMsg,
      isDanger,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        setActionLoading(true);
        try {
          const itemId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
          const res    = await cancelBooking(itemId);
          setMessage({ type: "success", text: res.msg ?? "تم الإلغاء بنجاح" });
          fetchItem();
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ?? "حدث خطأ أثناء الإلغاء";
          setMessage({ type: "error", text: msg });
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [id, isBooker, isDonor, fetchItem]);

  const onConfirm = useCallback(() => {
    confirmModal.onConfirm();
  }, [confirmModal]);

  return {
    item,
    loading,
    message,
    setMessage,
    actionLoading,
    currentUserId,
    isDonor,
    isBooker,
    isWaitlisted,
    isCancelledBefore,
    confirmModal,
    setConfirmModal,
    handleRequestItem,
    handleCancelAction,
    onConfirm,
    fetchItem,
  };
}
