// src/app/(main)/(protected)/dashboard/hooks/useDashboard.ts
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter }    from 'next/navigation';
import axiosInstance    from '@/lib/api/axiosInstance';
import { confirmReceipt, confirmDelivery } from '@/lib/api/itemApi';
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

interface DeliveryState {
  itemId:             string | null;
  waitingForDonor:    boolean;
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

  const [deliveryState, setDeliveryState] = useState<DeliveryState>({
    itemId: null,
    waitingForDonor: false,
  });
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false, title: '', message: '', onConfirm: () => {},
  });

  const [appealModal, setAppealModal] = useState<AppealModalState>({
    open: false, reportId: '',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  
  // ✅ تم الإصلاح هنا: إضافة [] لتعريف مصفوفة المؤقتات بشكل صحيح
  const timeoutIdsRef      = useRef<ReturnType<typeof setTimeout>[]>([]);
  const appealReportIdRef  = useRef<string>('');

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    const id = setTimeout(() => setToast(null), 3500);
    timeoutIdsRef.current.push(id);
  }, []);

  // ─── 1. جلب البيانات واستعادة الحالة عند الـ Refresh ───
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

        const myDonations = res.myDonations ?? [];
        const myRequests  = res.myRequests ?? [];

        setData({
          user: res.user,
          myDonations,
          myRequests,
        });

        const waitingItem = myDonations.find(
          (item) => item.status === 'محجوز' && item.recipientConfirmed === true
        );
        
        if (waitingItem) {
          setDeliveryState({
            itemId: waitingItem._id,
            waitingForDonor: true,
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          // ✅ فحص الخطأ بطريقة هيكلية آمنة لمنع استيراد أكسيوس العادي
          let errorMsg = String(err);
          if (err && typeof err === "object" && "isAxiosError" in err) {
            const axiosError = err as { response?: { status?: number; data?: { msg?: string } }; message?: string };
            errorMsg = axiosError.response?.data?.msg || axiosError.message || errorMsg;
          }
          setError(errorMsg);
          setData(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      abortControllerRef.current?.abort();
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = []; // ✅ ستعمل الآن بدون أي أخطاء
    };
  }, []);

  // ─── 2. الاستماع لأحداث الـ Socket الحية ───
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on('delivery:recipient_confirmed', ({ itemId, itemTitle }) => {
      showToast(`✅ ${itemTitle} — المستلم أكّد الاستلام، يرجى تأكيد التسليم الآن`, 'success');
      setDeliveryState({ itemId, waitingForDonor: true });
      
      setData(prev => prev ? {
        ...prev,
        myDonations: prev.myDonations.map(i => 
          i._id === itemId ? { ...i, recipientConfirmed: true } : i
        )
      } : prev);
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
      showToast('تم التسليم بنجاح! شكراً لعطائك 💚', 'success');
    });

    return () => {
      socket.off('delivery:recipient_confirmed');
      socket.off('delivery:completed');
    };
  }, [socketRef, showToast]);

  // ─── 3. إجراءات المستلم (تأكيد الاستلام) ───
  const handleRecipientConfirm = useCallback(async (itemId: string) => {
    setDeliveryLoading(true);
    try {
      const { msg } = await confirmReceipt(itemId);
      
      setData(prev => prev ? {
        ...prev,
        myRequests: prev.myRequests.map(i =>
          i._id === itemId ? { ...i, recipientConfirmed: true } : i
        ),
      } : prev);
      
      showToast(msg || '✅ تم تسجيل تأكيدك، بانتظار تأكيد المتبرع النهائي ⏳', 'success');
    } catch (err) {
      let msg = 'حدث خطأ غير متوقع';
      if (err && typeof err === "object" && "isAxiosError" in err) {
        const axiosError = err as { response?: { data?: { msg?: string } } };
        msg = axiosError.response?.data?.msg || msg;
      }
      showToast(msg, 'error');
    } finally {
      setDeliveryLoading(false);
    }
  }, [showToast]);

  // ─── 4. إجراءات المتبرع (تأكيد التسليم النهائي) ───
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
      showToast(msg || 'تم التسليم بنجاح واكتملت العملية! 💚', 'success');
    } catch (err) {
      let msg = 'حدث خطأ غير متوقع';
      if (err && typeof err === "object" && "isAxiosError" in err) {
        const axiosError = err as { response?: { data?: { msg?: string } } };
        msg = axiosError.response?.data?.msg || msg;
      }
      showToast(msg, 'error');
    } finally {
      setDeliveryLoading(false);
    }
  }, [showToast]);

  // ─── 5. إجراءات الحذف والإلغاء ───
  const handleDelete = useCallback((id: string, status: string) => {
    if (status === 'تم التسليم') { 
      showToast('لا يمكن حذف غرض تم تسليمه مسبقاً', 'error'); 
      return; 
    }
    
    setConfirmModal({
      open: true, 
      title: 'حذف الغرض',
      message: status === 'محجوز'
        ? 'هذا الغرض محجوز حالياً. هل أنت متأكد من حذفه؟ سيتم إلغاء الحجز تلقائياً وإرجاع الكوتا للمستلم.'
        : 'هل أنت متأكد من حذف هذا الغرض نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/api/items/delete/${id}`);
          setData(prev => prev
            ? { ...prev, myDonations: prev.myDonations.filter(i => i._id !== id) }
            : prev);
          showToast('تم حذف الغرض بنجاح', 'success');
        } catch { 
          showToast('حدث خطأ غير متوقع أثناء الحذف', 'error'); 
        } finally { 
          setConfirmModal(p => ({ ...p, open: false })); 
        }
      },
    });
  }, [showToast]);

  const handleCancelBooking = useCallback((id: string) => {
    setConfirmModal({
      open: true, 
      title: 'إلغاء الحجز',
      message: 'هل أنت متأكد من إلغاء حجزك لهذا الغرض؟',
      onConfirm: async () => {
        try {
          await axiosInstance.put(`/api/items/cancel/${id}`, {});
          setData(prev => prev
            ? { ...prev, myRequests: prev.myRequests.filter(i => i._id !== id) }
            : prev);
          showToast('تم إلغاء الحجز بنجاح', 'success');
        } catch { 
          showToast('حدث خطأ أثناء إلغاء الحجز', 'error'); 
        } finally { 
          setConfirmModal(p => ({ ...p, open: false })); 
        }
      },
    });
  }, [showToast]);

  const handleDonorCancelBooking = useCallback((id: string) => {
    setConfirmModal({
      open: true, 
      title: 'فك الحجز عن الغرض',
      message: 'هل تريد إلغاء حجز هذا المستخدم وإعادة الغرض متاحاً للجميع؟',
      onConfirm: async () => {
        try {
          await axiosInstance.put(`/api/items/cancel/${id}`, {});
          setData(prev => prev ? {
            ...prev,
            myDonations: prev.myDonations.map(i =>
              i._id === id ? { ...i, status: 'متاح' as const, bookedBy: null } : i
            ),
          } : prev);
          showToast('تم فك الحجز بنجاح وإعادة الغرض كـ متاح', 'success');
        } catch { 
          showToast('حدث خطأ أثناء فك الحجز', 'error'); 
        } finally { 
          setConfirmModal(p => ({ ...p, open: false })); 
        }
      },
    });
  }, [showToast]);

  const handleEdit = useCallback((id: string) => { 
    router.push(`/items/${id}/edit`);
  }, [router]);

  // ─── 6. نظام الاعتراضات (Appeals) ───
  const openAppealModal = useCallback((reportId: string) => {
    appealReportIdRef.current = reportId;
    setAppealModal({ open: true, reportId });
  }, []);

  const closeAppealModal = useCallback(() => setAppealModal({ open: false, reportId: '' }), []);

  const onAppealSuccess = useCallback(() => {
    const targetReportId = appealReportIdRef.current;
    setData(prev => {
      if (!prev) return prev;
      const clearReport = (items: DashboardItem[]) =>
        items.map(i => i.reportId === targetReportId ? { ...i, reportId: undefined } : i);
      return { 
        ...prev, 
        myDonations: clearReport(prev.myDonations), 
        myRequests: clearReport(prev.myRequests) 
      };
    });
    closeAppealModal();
    showToast('تم تقديم اعتراضك بنجاح وجاري مراجعته من قبل الإدارة ✅', 'success');
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
  };
}