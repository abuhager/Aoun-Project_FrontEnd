import { useEffect, useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axiosInstance";
import axios from "axios";

// ── الأنواع ───────────────────────────────────────────
export interface Item {
  _id: string;
  title: string;
  imageUrl: string;
  status: string;
  isRated: boolean;
  bookedBy?: { _id: string; name: string; phone: string };
}

interface User {
  name: string;
  email: string;
  trustScore: number;
  quota: number;
  isVerifiedStudent?: boolean;
  trustLevel?: 1 | 2;
  phoneVerified?: boolean;
}

interface DashboardData {
  user: User;
  myDonations: Item[];
  myRequests: Item[];
  totalDonations: number;
  quota: number;
  trustScore: number;
}

interface ConfirmModalState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

// ── الـ Hook الرئيسي ───────────────────────────────────
export function useDashboard() {
  const router = useRouter();
  const [data,      setData]      = useState<DashboardData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<"donations" | "requests">("donations");
  const [toast,     setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [otp,          setOtp]          = useState("");
  const [otpError,     setOtpError]     = useState("");
  const [otpLoading,   setOtpLoading]   = useState(false);

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false, title: "", message: "", onConfirm: () => {},
  });

  // ── جلب البيانات ─────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await axiosInstance.get("/api/items/user/my-items");
        setData({
          ...res,
          myDonations: res.myDonations ?? [],
          myRequests:  res.myRequests  ?? [],
        });
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Toast ─────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── حذف غرض (متاح فقط) ───────────────────────────────
  const handleDelete = useCallback((id: string, status: string) => {
    if (status === "تم التسليم") {
      showToast("لا يمكن حذف غرض تم تسليمه", "error");
      return;
    }
    const isBoosted = status === "محجوز";
    setConfirmModal({
      open: true,
      title: "حذف الغرض",
      message: isBoosted
        ? "هذا الغرض محجوز حالياً. هل أنت متأكد من حذفه؟ سيتم إلغاء الحجز تلقائياً."
        : "هل أنت متأكد من حذف هذا الغرض؟ لا يمكن التراجع.",
      onConfirm: async () => {
        try {
          // ✅ FIX: الـ route الصح هو DELETE /api/items/:id
          await axiosInstance.delete(`/api/items/${id}`);
          setData((prev) =>
            prev ? { ...prev, myDonations: prev.myDonations.filter((i) => i._id !== id) } : prev
          );
          showToast("تم حذف الغرض بنجاح", "success");
        } catch {
          showToast("حدث خطأ أثناء الحذف", "error");
        } finally {
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  }, [showToast]);

  // ── إلغاء الحجز (من طرف المستلم) ─────────────────────
  const handleCancelBooking = useCallback((id: string) => {
    setConfirmModal({
      open: true,
      title: "إلغاء الحجز",
      message: "هل أنت متأكد من إلغاء حجزك؟",
      onConfirm: async () => {
        try {
          await axiosInstance.put(`/api/items/cancel/${id}`, {});
          setData((prev) =>
            prev ? { ...prev, myRequests: prev.myRequests.filter((i) => i._id !== id) } : prev
          );
          showToast("تم إلغاء الحجز بنجاح", "success");
        } catch {
          showToast("حدث خطأ أثناء الإلغاء", "error");
        } finally {
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  }, [showToast]);

  // ── إلغاء الحجز من طرف المتبرع (فك الحجز عن غرضه) ───
  const handleDonorCancelBooking = useCallback((id: string) => {
    setConfirmModal({
      open: true,
      title: "فك الحجز",
      message: "هل تريد فك الحجز عن هذا الغرض وإعادته للقائمة؟",
      onConfirm: async () => {
        try {
          await axiosInstance.put(`/api/items/cancel/${id}`, {});
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  myDonations: prev.myDonations.map((i) =>
                    i._id === id ? { ...i, status: "متاح", bookedBy: undefined } : i
                  ),
                }
              : prev
          );
          showToast("تم فك الحجز بنجاح", "success");
        } catch {
          showToast("حدث خطأ أثناء فك الحجز", "error");
        } finally {
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  }, [showToast]);

  // ── تعديل غرض — يفتح صفحة التعديل ────────────────────
  const handleEdit = useCallback((id: string) => {
    router.push(`/items/${id}/edit`);
  }, [router]);

  // ── OTP Modal ─────────────────────────────────────────
  const openOtpModal = useCallback((item: Item) => {
    setSelectedItem(item);
    setOtp("");
    setOtpError("");
    setShowOtpModal(true);
  }, []);

  const closeOtpModal = useCallback(() => {
    setShowOtpModal(false);
    setSelectedItem(null);
    setOtp("");
    setOtpError("");
  }, []);

  // ── تأكيد التسليم ─────────────────────────────────────
  const handleConfirmDelivery = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem || otp.length < 4) {
      setOtpError("الرجاء إدخال رمز التسليم كاملاً");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      await axiosInstance.put(`/api/items/complete/${selectedItem._id}`, { otp });
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          myDonations: prev.myDonations.map((i) =>
            i._id === selectedItem._id ? { ...i, status: "تم التسليم" } : i
          ),
        };
      });
      closeOtpModal();
      showToast("تم تأكيد التسليم بنجاح 🎉", "success");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setOtpError(err.response?.data?.msg ?? "رمز التسليم غير صحيح");
      } else {
        setOtpError("حدث خطأ، حاول مجدداً");
      }
    } finally {
      setOtpLoading(false);
    }
  }, [selectedItem, otp, closeOtpModal, showToast]);

  return {
    data, loading,
    activeTab, setActiveTab,
    toast, setToast,
    showOtpModal,
    confirmModal, setConfirmModal,
    selectedItem,
    otp, setOtp,
    otpError,
    otpLoading,
    handleDelete,
    handleCancelBooking,
    handleDonorCancelBooking,
    handleEdit,
    handleConfirmDelivery,
    openOtpModal,
    closeOtpModal,
  };
}
