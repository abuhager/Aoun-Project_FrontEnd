import { useEffect, useState, useCallback, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// ─── الأنواع ───
interface User {
  name: string;
  email: string;
  trustScore: number;
  quota: number;
  isVerifiedStudent?: boolean;
}

interface Item {
  _id: string;
  title: string;
  imageUrl: string;
  status: string;
  createdAt: string;
  isRated: boolean;
  otp?: string;
  bookedBy?: { _id: string; name: string; phone: string };
  donor?:    { _id: string; name: string; phone: string };
}

interface DashboardData {
  myDonations: Item[];
  myRequests:  Item[];
  user:        User | null;
}

interface ConfirmModalState {
  show: boolean;
  msg: string;
  isDanger: boolean;
  onConfirm: () => void;
}

// ─── مساعد localStorage آمن مع SSR ───
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export function useDashboard() {
  const router = useRouter();
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  // ─── State ───
  const [data, setData] = useState<DashboardData>({
    myDonations: [], myRequests: [], user: null,
  });
  const [activeTab, setActiveTab] = useState<"donations" | "requests">("donations");
  const [loading, setLoading] = useState(true);

  // حالات الـ Modals
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false, msg: "", isDanger: false, onConfirm: () => {},
  });
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);

  // حالات الـ OTP
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [otp,          setOtp]          = useState("");
  const [otpError,     setOtpError]     = useState("");
  const [otpLoading,   setOtpLoading]   = useState(false);

  // ─── جلب البيانات ───
  const fetchData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return router.push("/login");
      const res = await axios.get(`${backendBaseUrl}/api/items/me`, {
        headers: { "x-auth-token": token },
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching dashboard", err);
    } finally {
      setLoading(false);
    }
  }, [router, backendBaseUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── 1. حذف الغرض ───
  const handleDelete = (id: string, status: string) => {
    const msg =
      status === "محجوز"
        ? "⚠️ تنبيه: هذا الغرض محجوز حالياً!\nحذفك له سيعتبر كسر التزام وسيتم خصم 3 نقاط من رصيدك.\nهل أنت متأكد؟"
        : "هل أنت متأكد من حذف هذا التبرع نهائياً؟";

    setConfirmModal({
      show: true,
      msg,
      isDanger: status === "محجوز",
      onConfirm: async () => {
        try {
          const token = getToken();
          if (!token) return;
          await axios.delete(`${backendBaseUrl}/api/items/delete/${id}`, {
            headers: { "x-auth-token": token },
          });
          setConfirmModal((prev) => ({ ...prev, show: false }));
          setToast({ msg: "تم حذف الغرض بنجاح ✅", type: "success" });
          fetchData();
        } catch {
          setConfirmModal((prev) => ({ ...prev, show: false }));
          setToast({ msg: "خطأ في الحذف، حاول مرة أخرى", type: "error" });
        }
      },
    });
  };

  // ─── 2. إلغاء حجز المستلم ───
  const handleCancelBooking = (id: string) => {
    setConfirmModal({
      show: true,
      msg: "هل تريد إلغاء حجز المستلم الحالي؟\n\nسيتم تمرير الدور تلقائياً للشخص التالي في الانتظار، وسيتم منع هذا المستلم من حجز الغرض مجدداً.",
      isDanger: true,
      onConfirm: async () => {
        try {
          const token = getToken();
          if (!token) return;
          await axios.put(
            `${backendBaseUrl}/api/items/cancel/${id}`,
            {},
            { headers: { "x-auth-token": token } }
          );
          setConfirmModal((prev) => ({ ...prev, show: false }));
          setToast({ msg: "تم إلغاء الحجز بنجاح 🔄", type: "success" });
          fetchData();
        } catch {
          setConfirmModal((prev) => ({ ...prev, show: false }));
          setToast({ msg: "خطأ في العملية، حاول مرة أخرى", type: "error" });
        }
      },
    });
  };

  // ─── 3. تأكيد التسليم بالـ OTP (6 خانات) ───
  const handleConfirmDelivery = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setOtpError("");
    setOtpLoading(true);
    try {
      const token = getToken();
      await axios.put(
        `${backendBaseUrl}/api/items/complete/${selectedItem._id}`,
        { otp },
        { headers: { "x-auth-token": token } }
      );
      setShowOtpModal(false);
      setOtp("");
      setToast({ msg: "تم تأكيد التسليم بنجاح! 💚", type: "success" });
      fetchData();
    } catch (err: any) {
      setOtpError(err.response?.data?.msg || "الرمز غير صحيح ❌");
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── فتح Modal الـ OTP ───
  const openOtpModal = (item: Item) => {
    setSelectedItem(item);
    setShowOtpModal(true);
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp("");
    setOtpError("");
  };

  return {
    // State
    data, activeTab, setActiveTab, loading,
    showOtpModal, confirmModal, setConfirmModal, toast, setToast,
    selectedItem, otp, setOtp, otpError, otpLoading,
    // Actions
    handleDelete, handleCancelBooking,
    handleConfirmDelivery,
    openOtpModal, closeOtpModal,
  };
}