// src/app/(main)/items/[id]/hooks/useItemDetails.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// [FIX-7] تصدير fetchItem من الـ hook حتى تستطيع الـ page
//         استدعاءها مباشرة بعد تأكيد التسليم بدلاً من reload
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams }   from 'next/navigation';
import axiosInstance   from '@/lib/api/axiosInstance';
import { useAuth } from "@/context/AuthContext";
import type { Item }   from '@/types/item.types';

type Msg = { type: 'success' | 'error'; text: string } | { type: ''; text: '' };

interface ConfirmModal {
  show:      boolean;
  msg:       string;
  isDanger:  boolean;
  onConfirm: () => void;
}

export function useItemDetails() {
  const { id }       = useParams<{ id: string }>();
  const { user }     = useAuth();

  const [item,          setItem]         = useState<Item | null>(null);
  const [loading,       setLoading]      = useState(true);
  const [message,       setMessage]      = useState<Msg>({ type: '', text: '' });
  const [actionLoading, setActionLoading]= useState(false);
  const [confirmModal,  setConfirmModal] = useState<ConfirmModal>({
    show: false, msg: '', isDanger: false, onConfirm: () => {},
  });

  // ── [FIX-7] fetchItem مُعرَّفة بـ useCallback وتُصدَّر ─────────
  const fetchItem = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await axiosInstance.get<{ item: Item }>(`/api/items/${id}`);
      setItem(data.item);
    } catch {
      setMessage({ type: 'error', text: 'تعذّر جلب تفاصيل الغرض' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const isDonor      = Boolean(user && item?.donor?._id === user._id);
  const isBooker     = Boolean(user && item?.bookedBy === user._id);
  const isWaitlisted = Boolean(user && item?.waitlist?.includes(user._id));
  const isCancelledBefore = Boolean(
    user && item?.cancelledUsers?.includes(user._id)
  );

  const showMsg = (type: 'success' | 'error', text: string, duration = 4000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), duration);
  };

  const openConfirm = (
    msg: string, isDanger: boolean, onConfirm: () => void
  ) => {
    setConfirmModal({ show: true, msg, isDanger, onConfirm });
  };

  const handleRequestItem = () => {
    if (!item) return;
    const isAvailable = item.status === 'متاح';
    openConfirm(
      isAvailable
        ? '🛒 هل تريد حجز هذا الغرض؟'
        : '⏳ هل تريد الانضمام لقائمة الانتظار؟',
      false,
      async () => {
        setConfirmModal((p) => ({ ...p, show: false }));
        setActionLoading(true);
        try {
          const endpoint = isAvailable
            ? `/api/items/${id}/book`
            : `/api/items/${id}/waitlist`;
          const { data } = await axiosInstance.post(endpoint);
          showMsg('success', data.msg);
          await fetchItem();
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ??
            'فشل الطلب';
          showMsg('error', msg);
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const handleCancelAction = () => {
    if (!item) return;
    let msg = '';
    let endpoint = '';

    if (isBooker) {
      msg      = '⚠️ هل أنت متأكد من إلغاء الحجز؟';
      endpoint = `/api/items/${id}/cancel-booking`;
    } else if (isWaitlisted) {
      msg      = '🚶‍♂️ هل تريد الانسحاب من قائمة الانتظار؟';
      endpoint = `/api/items/${id}/leave-waitlist`;
    } else if (isDonor && item.status === 'محجوز') {
      msg      = '🔄 هل تريد إلغاء الحجز الحالي والسماح لحاجز آخر؟';
      endpoint = `/api/items/${id}/cancel-booker`;
    } else return;

    openConfirm(msg, true, async () => {
      setConfirmModal((p) => ({ ...p, show: false }));
      setActionLoading(true);
      try {
        const { data } = await axiosInstance.post(endpoint);
        showMsg('success', data.msg);
        await fetchItem();
      } catch (err: unknown) {
        const errMsg =
          (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ??
          'فشل الإلغاء';
        showMsg('error', errMsg);
      } finally {
        setActionLoading(false);
      }
    });
  };

  return {
    item, loading, message, actionLoading,
    confirmModal, setConfirmModal,
    isDonor, isBooker, isWaitlisted, isCancelledBefore,
    handleRequestItem, handleCancelAction,
    fetchItem,  // [FIX-7] ← مُصدَّر
  };
}
