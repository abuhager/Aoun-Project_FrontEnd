import { useEffect, useState, useCallback, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// ── الأنواع ────────────────────────────────────────────────
interface User {
  name: string;
  email: string;
  trustScore: number;
  quota: number;
  isVerifiedStudent?: boolean;
  trustLevel?: 1 | 2;
  phoneVerified?: boolean;
}

interface Item {
  _id: string;
  title: string;
  imageUrl: string;
  status: string;
  isRated: boolean;
  bookedBy?: { _id: string; name: string; phone: string };
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

// ── Helper: قراءة التوكن ────────────────────────────────
function getToken(): string {
  return Cookies.get("token") ?? "";
}

// ── الـ Hook الرئيسي ──────────────────────────────────
export function useDashboard() {
  const router = useRouter();

  // ── States ──
  const [data, setData]               = useState<DashboardData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<"donations" | "requests">("donations");
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // OTP Modal
  const [showOtpModal, setShowOtpModal]   = useState(false);
  const [selectedItem, setSelectedItem]   = useState<Item | null>(null);
  const [otp, setOtp]                     = useState("");
  const [otpError, setOtpError]           = useState("");
  const [otpLoading, setOtpLoading]       = useState(false);

  // Confirm Modal — ✅ open (وليس show)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // ── جلب البيانات ────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) { router.push("/login"); return; }

        // ✅ FIX: الـ endpoint الصحيح بعد Phase 1
        const { data: res } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/items/user/my-items`,
          { headers: { "x-auth-token": token } }
        );

        // ✅ Fallback: ضمان وجود المصفوفات حتى لو الـ API أعاد null
        setData({
          ...res,
          myDonations: res.myDonations ?? [],
          myRequests:  res.myRequests  ?? [],
        });
      } catch {
        showToast("حدث خطأ في تحميل البيانات", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ── Toast ───────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── حذف غرض ───────────────────────────────────────────
  const handleDelete = useCallback((id: string, status: string) => {
    if (status !== "متاح") {
      showToast("لا يمكن حذف غرض محجوز", "error");
      return;
    }
    setConfirmModal({
      open: true,
      title: "حذف الغرض",
      message: "هل أنت متأكد من حذف هذا الغرض؟ لا يمكن التراجع.",
      onConfirm: async () => {
        try {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/api/items/delete/${id}`,
            { headers: { "x-auth-token": getToken() } }
          );
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

  // ── إلغاء الحجز ──────────────────────────────────────────
  const handleCancelBooking = useCallback((id: string) => {
    setConfirmModal({
      open: true,
      title: "إلغاء الحجز",
      message: "هل أنت متأكد من إلغاء حجزك؟",
      onConfirm: async () => {
        try {
          await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/api/items/cancel/${id}`,
            {},
            { headers: { "x-auth-token": getToken() } }
          );
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

  // ── فتح OTP Modal ──────────────────────────────────────
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

  // ── تأكيد التسليم ──────────────────────────────────────
  const handleConfirmDelivery = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem || otp.length < 4) {
      setOtpError("الرجاء إدخال رمز التسليم كاملاً");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/items/complete/${selectedItem._id}`,
        { otp },
        { headers: { "x-auth-token": getToken() } }
      );

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
    data,
    loading,
    activeTab,        setActiveTab,
    toast,            setToast,
    showOtpModal,
    confirmModal,     setConfirmModal,
    selectedItem,
    otp,              setOtp,
    otpError,
    otpLoading,
    handleDelete,
    handleCancelBooking,
    handleConfirmDelivery,
    openOtpModal,
    closeOtpModal,
  };
}
