// src/app/(main)/(protected)/dashboard/hooks/useDashboard.ts
// يستخدم /api/items/me (endpoint واحد يرجع كل شيء)
import { useEffect, useState, useCallback, useRef, FormEvent } from 'react'; // ✅ Fix Bug #4 #12 — أضيف useRef
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/api/axiosInstance';
import axios from 'axios';
import type { DashboardItem, MyItemsResponse } from '@/types/item.types';

// ✅ نستخدم DashboardItem من الـ types بدل تعريف محلي
export type { DashboardItem as Item };

interface DashboardData {
  user: MyItemsResponse['user'];
  myDonations: DashboardItem[];
  myRequests:  DashboardItem[];
}

interface ConfirmModalState {
  open:      boolean;
  title:     string;
  message:   string;
  onConfirm: () => void;
}

// ── helpers ────────────────────────────────────────────
export function getBookedByName(val: DashboardItem['bookedBy']): string {
  if (!val) return '';
  return val.name ?? '';
}

export function useDashboard() {
  const router = useRouter();
  const [data,      setData]      = useState<DashboardData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'donations' | 'requests'>('donations');
  const [toast,     setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);
  const [otp,          setOtp]          = useState('');
  const [otpError,     setOtpError]     = useState('');
  const [otpLoading,   setOtpLoading]   = useState(false);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false, title: '', message: '', onConfirm: () => {},
  });

  // ✅ Fix Bug #12 — AbortController ref لإلغاء الطلب عند unmount
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ Fix Bug #4 — timeout IDs ref لتنظيف كل setTimeout عند unmount
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // ✅ Fix Bug #12 — إلغاء أي طلب سابق قبل بدء جديد
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchData = async () => {
      try {
        const { data: res } = await axiosInstance.get<MyItemsResponse>(
          '/api/items/me',
          { signal: controller.signal }, // ✅ Fix Bug #12 — ربط الطلب بالـ controller
        );

        if (controller.signal.aborted) return; // ✅ Fix Bug #12 — لا تُحدِّث state بعد unmount

        setData({
          user:        res.user,
          myDonations: res.myDonations ?? [],
          myRequests:  res.myRequests  ?? [],
        });
      } catch (err: unknown) {
        // ✅ Fix Bug #12 — تجاهل AbortError (طبيعي عند unmount أو re-fetch)
        if (err instanceof Error && err.name === 'AbortError') return;

        if (!controller.signal.aborted) {
          if (axios.isAxiosError(err)) {
            const status  = err.response?.status;
            const message = err.response?.data?.msg ?? err.message;
            console.error('[Dashboard] API Error:', { status, message, url: err.config?.url });
            setError(`${status ?? 'Network'}: ${message} (${err.config?.url})`);
          } else {
            setError(String(err));
          }
          setData(null);
        }
      } finally {
        if (!controller.signal.aborted) { // ✅ Fix Bug #12 — فقط إذا لم يُلغَ
          setLoading(false);
        }
      }
    };

    fetchData();

    // ✅ Fix Bug #12 + #4 — cleanup شامل عند unmount
    return () => {
      abortControllerRef.current?.abort();
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
    };
  }, []);

  // ✅ Fix Bug #4 — تسجيل الـ timeout في ref بدل إطلاقه حراً
  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    const id = setTimeout(() => setToast(null), 3500);
    timeoutIdsRef.current.push(id); // ✅ Fix Bug #4 — يُنظَّف في cleanup
  }, []);

  const handleDelete = useCallback((id: string, status: string) => {
    if (status === 'تم التسليم') {
      showToast('لا يمكن حذف غرض تم تسليمه', 'error');
      return;
    }
    setConfirmModal({
      open: true, title: 'حذف الغرض',
      message: status === 'محجوز'
        ? 'هذا الغرض محجوز حالياً. هل أنت متأكد من حذفه؟ سيتم إلغاء الحجز تلقائياً.'
        : 'هل أنت متأكد من حذف هذا الغرض؟ لا يمكن التراجع.',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/api/items/delete/${id}`);
          setData(prev => prev
            ? { ...prev, myDonations: prev.myDonations.filter(i => i._id !== id) }
            : prev);
          showToast('تم حذف الغرض بنجاح', 'success');
        } catch {
          showToast('حدث خطأ أثناء الحذف', 'error');
        } finally {
          setConfirmModal(prev => ({ ...prev, open: false }));
        }
      },
    });
  }, [showToast]);

  const handleCancelBooking = useCallback((id: string) => {
    setConfirmModal({
      open: true, title: 'إلغاء الحجز',
      message: 'هل أنت متأكد من إلغاء حجزك؟',
      onConfirm: async () => {
        try {
          await axiosInstance.put(`/api/items/cancel/${id}`, {});
          setData(prev => prev
            ? { ...prev, myRequests: prev.myRequests.filter(i => i._id !== id) }
            : prev);
          showToast('تم إلغاء الحجز بنجاح', 'success');
        } catch {
          showToast('حدث خطأ أثناء الإلغاء', 'error');
        } finally {
          setConfirmModal(prev => ({ ...prev, open: false }));
        }
      },
    });
  }, [showToast]);

  const handleDonorCancelBooking = useCallback((id: string) => {
    setConfirmModal({
      open: true, title: 'فك الحجز',
      message: 'هل تريد فك الحجز عن هذا الغرض وإعادته للقائمة؟',
      onConfirm: async () => {
        try {
          await axiosInstance.put(`/api/items/cancel/${id}`, {});
          setData(prev => prev ? {
            ...prev,
            myDonations: prev.myDonations.map(i =>
              i._id === id ? { ...i, status: 'متاح' as const, bookedBy: null } : i
            ),
          } : prev);
          showToast('تم فك الحجز بنجاح', 'success');
        } catch {
          showToast('حدث خطأ أثناء فك الحجز', 'error');
        } finally {
          setConfirmModal(prev => ({ ...prev, open: false }));
        }
      },
    });
  }, [showToast]);

  const handleEdit = useCallback((id: string) => {
    router.push(`/edit-item/${id}`);
  }, [router]);

  const openOtpModal = useCallback((item: DashboardItem) => {
    setSelectedItem(item); setOtp(''); setOtpError(''); setShowOtpModal(true);
  }, []);

  const closeOtpModal = useCallback(() => {
    setShowOtpModal(false); setSelectedItem(null); setOtp(''); setOtpError('');
  }, []);

  const handleConfirmDelivery = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem || otp.length < 4) {
      setOtpError('الرجاء إدخال رمز التسليم كاملاً');
      return;
    }
    setOtpLoading(true); setOtpError('');
    try {
      await axiosInstance.put(`/api/items/complete/${selectedItem._id}`, { otp });
      setData(prev => prev ? {
        ...prev,
        myDonations: prev.myDonations.map(i =>
          i._id === selectedItem._id ? { ...i, status: 'تم التسليم' as const } : i
        ),
      } : prev);
      closeOtpModal();
      showToast('تم تأكيد التسليم بنجاح 🎉', 'success');
    } catch (err: unknown) {
      setOtpError(
        axios.isAxiosError(err)
          ? err.response?.data?.msg ?? 'رمز التسليم غير صحيح'
          : 'حدث خطأ، حاول مجدداً'
      );
    } finally {
      setOtpLoading(false);
    }
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