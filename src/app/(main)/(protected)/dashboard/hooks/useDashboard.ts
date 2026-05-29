// src/app/(main)/(protected)/dashboard/hooks/useDashboard.ts
// ✅ Patched: OTP Modal → Double Confirmation Flow (Socket.io)

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter }    from 'next/navigation';
import axiosInstance    from '@/lib/api/axiosInstance';
import { confirmReceipt, confirmDelivery } from '@/lib/api/itemApi';
import axios            from 'axios';
import { useSocket }    from '@/hooks/useSocket';
import type { DashboardItem, MyItemsResponse } from '@/types/item.types';

export type { DashboardItem as Item };

interface DashboardData {
  user:        MyItemsResponse['user'];
  myDonations: DashboardItem[];
  myRequests:  DashboardItem[];
}

interface ConfirmModalState {
  open:      boolean;
  title:     string;
  message:   string;
  onConfirm: () => void;
}

interface AppealModalState {
  open:     boolean;
  reportId: string;
}

// حالة التسليم المزدوج
interface DeliveryState {
  itemId:             string | null;
  waitingForDonor:    boolean; // المستلم أكّد، ننتظر المتبرع
}

export function getBookedByName(val: DashboardItem['bookedBy']): string {
  if (!val) return '';
  return val.name ?? '';
}

export function useDashboard() {
  const router = useRouter();
const socketRef = useSocket();

  const [data,      setData]      = useState<DashboardData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'donations' | 'requests'>('donations');
  const [toast,     setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ✅ Double Confirmation state (استبدل OTP state)
  const [deliveryState, setDeliveryState] = useState<DeliveryState>({
    itemId: null, waitingForDonor: false,
  });
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false, title: '', message: '', onConfirm: () => {},
  });

  const [appealModal, setAppealModal] = useState<AppealModalState>({
    open: false, reportId: '',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdsRef      = useRef<ReturnType<typeof setTimeout>[]>([]);
  const appealReportIdRef  = useRef<string>('');

  // ── Fetch data ──────────────────────────────────────────────
  useEffect(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    (async () => {
      try {
        const { data: res } = await axiosInstance.get<MyItemsResponse>(
          '/api/items/me',
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setData({
          user:        res.user,
          myDonations: res.myDonations ?? [],
          myRequests:  res.myRequests  ?? [],
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setError(axios.isAxiosError(err)
            ? `${err.response?.status ?? 'Network'}: ${err.response?.data?.msg ?? err.message}`
            : String(err)
          );
          setData(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      abortControllerRef.current?.abort();
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
    };
  }, []);

  // ── Socket: المتبرع يستمع لتأكيد المستلم ──────────────────
 useEffect(() => {
  const socket = socketRef.current;  // ✅ اجلب .current هنا
  if (!socket) return;

  socket.on('delivery:recipient_confirmed', ({ itemId, itemTitle }) => {
    showToast(`✅ ${itemTitle} — المستلم أكّد الاستلام، أكّد أنت التسليم الآن`, 'success');
    setDeliveryState({ itemId, waitingForDonor: true });
  });

  socket.on('delivery:completed', ({ itemId }) => {
    setData(prev => prev ? {
      ...prev,
      myDonations: prev.myDonations.map(i =>
        i._id === itemId ? { ...i, status: 'تم التسليم' as const } : i
      ),
      myRequests: prev.myRequests.map(i =>
        i._id === itemId ? { ...i, status: 'تم التسليم' as const } : i
      ),
    } : prev);
    setDeliveryState({ itemId: null, waitingForDonor: false });
    showToast('تم التسليم بنجاح! 💚', 'success');
  });

  return () => {
    socket.off('delivery:recipient_confirmed');
    socket.off('delivery:completed');
  };
}, [socketRef.current]); // ✅ اربطه بـ .current مش بالـ ref نفسه// eslint-disable-line react-hooks/exhaustive-deps

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    const id = setTimeout(() => setToast(null), 3500);
    timeoutIdsRef.current.push(id);
  }, []);

  // ── Double Confirmation: المستلم يضغط "تأكيد الاستلام" ────
  const handleRecipientConfirm = useCallback(async (itemId: string) => {
    setDeliveryLoading(true);
    try {
      const { msg } = await confirmReceipt(itemId);
      // حدّث الـ UI — في انتظار المتبرع
      setData(prev => prev ? {
        ...prev,
        myRequests: prev.myRequests.map(i =>
          i._id === itemId ? { ...i, recipientConfirmed: true } : i
        ),
      } : prev);
      showToast(msg || '✅ تم إرسال تأكيدك، في انتظار المتبرع ⏳', 'success');
    } catch (err) {
      showToast(
        axios.isAxiosError(err) ? err.response?.data?.msg ?? 'حدث خطأ' : 'حدث خطأ',
        'error'
      );
    } finally {
      setDeliveryLoading(false);
    }
  }, [showToast]);

  // ── Double Confirmation: المتبرع يضغط "تأكيد التسليم" ─────
  const handleDonorConfirm = useCallback(async (itemId: string) => {
    setDeliveryLoading(true);
    try {
      const { msg } = await confirmDelivery(itemId);
      setData(prev => prev ? {
        ...prev,
        myDonations: prev.myDonations.map(i =>
          i._id === itemId ? { ...i, status: 'تم التسليم' as const } : i
        ),
      } : prev);
      setDeliveryState({ itemId: null, waitingForDonor: false });
      showToast(msg || 'تم التسليم بنجاح! 💚', 'success');
    } catch (err) {
      showToast(
        axios.isAxiosError(err) ? err.response?.data?.msg ?? 'حدث خطأ' : 'حدث خطأ',
        'error'
      );
    } finally {
      setDeliveryLoading(false);
    }
  }, [showToast]);

  // ── باقي الـ handlers (بدون تغيير) ─────────────────────────
  const handleDelete = useCallback((id: string, status: string) => {
    if (status === 'تم التسليم') { showToast('لا يمكن حذف غرض تم تسليمه', 'error'); return; }
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
        } catch { showToast('حدث خطأ أثناء الحذف', 'error'); }
        finally  { setConfirmModal(p => ({ ...p, open: false })); }
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
        } catch { showToast('حدث خطأ أثناء الإلغاء', 'error'); }
        finally  { setConfirmModal(p => ({ ...p, open: false })); }
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
        } catch { showToast('حدث خطأ أثناء فك الحجز', 'error'); }
        finally  { setConfirmModal(p => ({ ...p, open: false })); }
      },
    });
  }, [showToast]);

  const handleEdit = useCallback((id: string) => { router.push(`/edit-item/${id}`); }, [router]);

  const openAppealModal  = useCallback((reportId: string) => {
    appealReportIdRef.current = reportId;
    setAppealModal({ open: true, reportId });
  }, []);
  const closeAppealModal = useCallback(() => setAppealModal({ open: false, reportId: '' }), []);
  const onAppealSuccess  = useCallback(() => {
    const targetReportId = appealReportIdRef.current;
    setData(prev => {
      if (!prev) return prev;
      const clearReport = (items: DashboardItem[]) =>
        items.map(i => i.reportId === targetReportId ? { ...i, reportId: undefined } : i);
      return { ...prev, myDonations: clearReport(prev.myDonations), myRequests: clearReport(prev.myRequests) };
    });
    closeAppealModal();
    showToast('تم تقديم اعتراضك بنجاح ✅', 'success');
  }, [closeAppealModal, showToast]);

  return {
    data, loading, error,
    activeTab, setActiveTab,
    toast, setToast,
    confirmModal, setConfirmModal,
    deliveryState, deliveryLoading,
    handleRecipientConfirm,
    handleDonorConfirm,
    handleDelete, handleCancelBooking, handleDonorCancelBooking,
    handleEdit,
    appealModal, openAppealModal, closeAppealModal, onAppealSuccess,
    // ✅ محذوف: showOtpModal, selectedItem, otp, otpError, otpLoading, openOtpModal, closeOtpModal, handleConfirmDelivery
  };
}
