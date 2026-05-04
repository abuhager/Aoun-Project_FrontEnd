import { useEffect, useState, useCallback, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// ── الأنواع ──────────────────────────────────────────
interface User {
  name: string;
  email: string;
  trustScore: number;
  quota: number;
  isVerifiedStudent?: boolean;
}

// ✅ حذف otp من الـ Item interface نهائياً
interface Item {
  _id: string;
  title: string;
  imageUrl: string;
  status: string;
  isRated: boolean;
  // otp?: string; ← محذوف — OTP لا يأتي من الـ API بعد الآن
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

// ── Helper: قراءة التوكن ─────────────────────────────
function getToken(): string {
  return Cookies.get("token") ?? "";
}

// ── الـ Hook الرئيسي ─────────────────────────────────
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
  const [otp, setOtp]                     = useState("");        // ← هاد input من المستخدم، مش من الـ API
  const [otpError, setOtpError]           = useState("");
  const [otpLoading, setOtpLoading]       = useState(false);

  // Confirm Modal
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

        const { data: res } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/items/me`,
          { headers: { "x-auth-token": token } }
        );
        setData(res);
      } catch {
        showToast("حدث خطأ في تحميل البيانات", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // ── Toast ────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── حذف غرض ─────────────────────────────────────────
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

  // ── إلغاء الحجز ──────────────────────────────────────
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

  // ── فتح OTP Modal ────────────────────────────────────
  const openOtpModal = useCallback((item: Item) => {
    setSelectedItem(item);
    setOtp("");           // ← فارغ — المستخدم يدخل الـ OTP من الإيميل
    setOtpError("");
    setShowOtpModal(true);
  }, []);

  const closeOtpModal = useCallback(() => {
    setShowOtpModal(false);
    setSelectedItem(null);
    setOtp("");
    setOtpError("");
  }, []);

  // ── تأكيد التسليم ────────────────────────────────────
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
        { otp },   // ← الـ OTP اللي كتبه المستخدم يدوياً من الإيميل
        { headers: { "x-auth-token": getToken() } }
      );

      // تحديث الـ state
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