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
  donor?: string | { _id: string };     // البيكند يرجعه string ID
  bookedBy?: string | { _id: string; name: string; phone: string };
}

interface JwtPayload {
  user?: { id?: string; _id?: string; role?: string; name?: string; email?: string };
  exp?: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  trustScore: number;
  quota: number;
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

// ── فك الـ JWT من الـ cookie (بدون verify) ────────────────────────
function getUserFromToken(): { id: string; name: string; email: string } | null {
  try {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    if (!match?.[1]) return null;
    const token = decodeURIComponent(match[1]);
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as JwtPayload;
    const u = payload.user;
    const id = u?.id ?? u?._id ?? '';
    if (!id) return null;
    return { id, name: u?.name ?? '', email: u?.email ?? '' };
  } catch {
    return null;
  }
}

// ── مساعدة للمقارنة سواء donor كان string أو object ─────────────
function getId(val: string | { _id: string } | undefined): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val._id;
}

// ── الـ Hook الرئيسي ───────────────────────────────────
export function useDashboard() {
  const router = useRouter();
  const [data,      setData]      = useState<DashboardData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'donations' | 'requests'>('donations');
  const [toast,     setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [otp,          setOtp]          = useState('');
  const [otpError,     setOtpError]     = useState('');
  const [otpLoading,   setOtpLoading]   = useState(false);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false, title: '', message: '', onConfirm: () => {},
  });

  // ── جلب البيانات ─────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. استخرج بيانات المستخدم من الـ JWT محلياً (decode فقط — بدون API call)
        const tokenUser = getUserFromToken();
        if (!tokenUser) throw new Error('لم يتم العثور على بيانات الجلسة');

        // 2. كل الأغراض — نفلتر بـ donor و bookedBy
        const { data: itemsRes } = await axiosInstance.get<{ items: Item[] }>('/api/items');
        const allItems = itemsRes.items ?? [];

        const myDonations = allItems.filter(i => getId(i.donor)   === tokenUser.id);
        const myRequests  = allItems.filter(i => getId(i.bookedBy as string | { _id: string; name: string; phone: string } | undefined) === tokenUser.id);

        setData({
          user: {
            _id:        tokenUser.id,
            name:       tokenUser.name,
            email:      tokenUser.email,
            trustScore: 0,   // سيتحدث بعد إضافة endpoint مخصص
            quota:      0,
          },
          myDonations,
          myRequests,
          totalDonations: myDonations.length,
          quota:          0,
          trustScore:     0,
        });
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const status  = err.response?.status;
          const message = err.response?.data?.msg ?? err.message;
          const url     = err.config?.url;
          console.error('[Dashboard] API Error:', { status, message, url });
          setError(`${status ?? 'Network'}: ${message} (${url})`);
        } else {
          console.error('[Dashboard] Unknown error:', err);
          setError(String(err));
        }
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleDelete = useCallback((id: string, status: string) => {
    if (status === 'تم التسليم') { showToast('لا يمكن حذف غرض تم تسليمه', 'error'); return; }
    const isBoosted = status === 'محجوز';
    setConfirmModal({
      open: true, title: 'حذف الغرض',
      message: isBoosted
        ? 'هذا الغرض محجوز حالياً. هل أنت متأكد من حذفه؟ سيتم إلغاء الحجز تلقائياً.'
        : 'هل أنت متأكد من حذف هذا الغرض؟ لا يمكن التراجع.',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/api/items/${id}`);
          setData(prev => prev ? { ...prev, myDonations: prev.myDonations.filter(i => i._id !== id) } : prev);
          showToast('تم حذف الغرض بنجاح', 'success');
        } catch { showToast('حدث خطأ أثناء الحذف', 'error'); }
        finally { setConfirmModal(prev => ({ ...prev, open: false })); }
      },
    });
  }, [showToast]);

  const handleCancelBooking = useCallback((id: string) => {
    setConfirmModal({
      open: true, title: 'إلغاء الحجز', message: 'هل أنت متأكد من إلغاء حجزك؟',
      onConfirm: async () => {
        try {
          await axiosInstance.put(`/api/items/cancel/${id}`, {});
          setData(prev => prev ? { ...prev, myRequests: prev.myRequests.filter(i => i._id !== id) } : prev);
          showToast('تم إلغاء الحجز بنجاح', 'success');
        } catch { showToast('حدث خطأ أثناء الإلغاء', 'error'); }
        finally { setConfirmModal(prev => ({ ...prev, open: false })); }
      },
    });
  }, [showToast]);

  const handleDonorCancelBooking = useCallback((id: string) => {
    setConfirmModal({
      open: true, title: 'فك الحجز', message: 'هل تريد فك الحجز عن هذا الغرض وإعادته للقائمة؟',
      onConfirm: async () => {
        try {
          await axiosInstance.put(`/api/items/cancel/${id}`, {});
          setData(prev => prev ? {
            ...prev,
            myDonations: prev.myDonations.map(i => i._id === id ? { ...i, status: 'متاح', bookedBy: undefined } : i),
          } : prev);
          showToast('تم فك الحجز بنجاح', 'success');
        } catch { showToast('حدث خطأ أثناء فك الحجز', 'error'); }
        finally { setConfirmModal(prev => ({ ...prev, open: false })); }
      },
    });
  }, [showToast]);

  const handleEdit = useCallback((id: string) => { router.push(`/items/${id}/edit`); }, [router]);

  const openOtpModal = useCallback((item: Item) => {
    setSelectedItem(item); setOtp(''); setOtpError(''); setShowOtpModal(true);
  }, []);

  const closeOtpModal = useCallback(() => {
    setShowOtpModal(false); setSelectedItem(null); setOtp(''); setOtpError('');
  }, []);

  const handleConfirmDelivery = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem || otp.length < 4) { setOtpError('الرجاء إدخال رمز التسليم كاملاً'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      await axiosInstance.put(`/api/items/complete/${selectedItem._id}`, { otp });
      setData(prev => prev ? {
        ...prev,
        myDonations: prev.myDonations.map(i => i._id === selectedItem._id ? { ...i, status: 'تم التسليم' } : i),
      } : prev);
      closeOtpModal();
      showToast('تم تأكيد التسليم بنجاح 🎉', 'success');
    } catch (err: unknown) {
      setOtpError(axios.isAxiosError(err) ? err.response?.data?.msg ?? 'رمز التسليم غير صحيح' : 'حدث خطأ، حاول مجدداً');
    } finally { setOtpLoading(false); }
  }, [selectedItem, otp, closeOtpModal, showToast]);

  return {
    data, loading, error,
    activeTab, setActiveTab,
    toast, setToast,
    showOtpModal,
    confirmModal, setConfirmModal,
    selectedItem,
    otp, setOtp, otpError, otpLoading,
    handleDelete, handleCancelBooking, handleDonorCancelBooking,
    handleEdit, handleConfirmDelivery,
    openOtpModal, closeOtpModal,
  };
}
