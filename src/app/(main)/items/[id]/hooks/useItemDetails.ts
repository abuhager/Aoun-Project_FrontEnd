import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { itemApi } from "@/lib/api/itemApi";
import { Item } from "@/types/item.types";

// ─── مساعد استخراج الـ ID من أي شكل ───
const getId = (field: any): string | null => {
  if (!field) return null;
  if (typeof field === "string") return field;
  if (typeof field === "object" && field._id) return String(field._id);
  return null;
};

// ─── النوع الخاص بحالة الـ Modal ───
interface ConfirmModalState {
  show: boolean;
  msg: string;
  isDanger: boolean;
  onConfirm: () => void;
}

export function useItemDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    msg: "",
    isDanger: false,
    onConfirm: () => {},
  });

  // ─── جلب بيانات الغرض ───
  const fetchItem = useCallback(
    async (isMounted = true) => {
      try {
        const data = await itemApi.getItemById(id as string);
        if (isMounted) setItem(data);
      } catch {
        console.error("Error fetching item");
      } finally {
        if (isMounted) setLoading(false);
      }
    },
    [id]
  );

  // ─── استخراج userId من الـ JWT ───
  useEffect(() => {
    let isMounted = true;

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserId(payload.user.id || payload.user._id);
        } catch {}
      }
    }

    if (id) fetchItem(isMounted);
    return () => {
      isMounted = false;
    };
  }, [id, fetchItem]);

  // ─── حسابات الصلاحيات ───
  const isDonor = getId(item?.donor) === currentUserId;
  const isBooker = getId(item?.bookedBy) === currentUserId;
  const isWaitlisted = item?.waitlist?.some((w) => getId(w.user) === currentUserId);
  const isCancelledBefore = item?.cancelledBy?.some((uid) => getId(uid) === currentUserId);

  // ─── طلب الحجز ───
  const handleRequestItem = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push(`/login?redirect=/items/${id}`);

    try {
      setActionLoading(true);
      setMessage({ type: "", text: "" });
      const res = await itemApi.bookItem(id as string);
      setMessage({ type: "success", text: res.message || res.msg || "العملية تمت بنجاح" });
      fetchItem(true);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.msg || "حدث خطأ أثناء الطلب" });
    } finally {
      setActionLoading(false);
    }
  };

  // ─── إلغاء الحجز / الانسحاب من الانتظار ───
  const handleCancelAction = () => {
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
        try {
          setActionLoading(true);
          const res = await itemApi.cancelBooking(id as string);
          setMessage({ type: "success", text: res.msg });
          fetchItem(true);
        } catch (err: any) {
          setMessage({ type: "error", text: err.response?.data?.msg || "حدث خطأ أثناء الإلغاء" });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  return {
    // State
    item,
    loading,
    message,
    actionLoading,
    confirmModal,
    setConfirmModal,
    // Computed
    isDonor,
    isBooker,
    isWaitlisted,
    isCancelledBefore,
    // Actions
    handleRequestItem,
    handleCancelAction,
  };
}