// src/hooks/useDeliveryConfirmation.ts — ✅ DEFINITIVE FIX (MATCHING API SIGNATURE)
'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSocket }                                  from '@/hooks/useSocket';
import { confirmDelivery, getItemById }               from '@/lib/api/itemApi'; // ✅ استيراد سليم
import type { Item }                                  from '@/types/item.types'; // ✅ استيراد نوع الـ Item الموحد
import toast                                          from 'react-hot-toast';

type ConfirmationType = 'recipient_confirm' | 'donor_confirm';
type DeliveryStatus   = 'idle' | 'recipient_confirming' | 'waiting_donor' | 'donor_confirming' | 'completed' | 'error';

interface Props  { itemId: string; userRole: 'donor' | 'recipient'; initialRecipientConfirmed?: boolean; onSuccess?: (id: string) => void; }
interface Return { status: DeliveryStatus; isLoading: boolean; errorMsg: string | null; confirmReceipt: () => Promise<void>; confirmDelivery: () => Promise<void>; canConfirm: boolean; }

export function useDeliveryConfirmation({ itemId, userRole, initialRecipientConfirmed = false, onSuccess }: Props): Return {
  const socketRef   = useSocket();
  const [status,    setStatus]   = useState<DeliveryStatus>(initialRecipientConfirmed ? 'waiting_donor' : 'idle');
  const [isLoading, setLoading]  = useState(false);
  const [errorMsg,  setErrorMsg] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => () => { isMountedRef.current = false; }, []);

  // Offline fallback — التحقق من حالة الـ item عند الـ mount للتأكد من حالة التسليم
  useEffect(() => {
    if (userRole !== 'donor') return;
    if (initialRecipientConfirmed) return;

    let cancelled = false;
    getItemById(itemId)
      .then((item: Item) => {
        if (cancelled) return;
        if (item.recipientConfirmed && !item.donorConfirmed) {
          setStatus('waiting_donor');
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [itemId, userRole, initialRecipientConfirmed]);

  // Socket listeners لمزامنة تسليم التبرعات في الوقت الفعلي
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onRC = (d: { itemId: string; message: string }) => {
      if (d.itemId !== itemId) return;
      setStatus('waiting_donor');
      toast.success(d.message ?? 'المستلم أكّد الاستلام ✅');
    };
    const onC = (d: { itemId: string; message: string }) => {
      if (d.itemId !== itemId) return;
      setStatus('completed');
      toast.success(d.message ?? 'تم التسليم 🎉');
      onSuccess?.(itemId);
    };
    socket.on('delivery:recipient_confirmed', onRC);
    socket.on('delivery:completed',           onC);
    return () => {
      socket.off('delivery:recipient_confirmed', onRC);
      socket.off('delivery:completed',           onC);
    };
  }, [socketRef, itemId, onSuccess]);

  const sendConfirmation = useCallback(async (type: ConfirmationType) => {
    if (isLoading) return;
    setLoading(true);
    setErrorMsg(null);
    setStatus(type === 'recipient_confirm' ? 'recipient_confirming' : 'donor_confirming');

    try {
      // ✅ إصلاح الخطأ: تمرير معامل واحد فقط (itemId) متوافق 100% مع الـ API المتوفر لديك
      const data = await confirmDelivery(itemId);
      if (!isMountedRef.current) return;

      if (type === 'recipient_confirm') {
        setStatus('waiting_donor');
        toast.success(data.msg ?? 'تم التأكيد ✅');
      } else {
        setStatus('completed');
        toast.success(data.msg ?? 'تم التسليم 🎉');
        onSuccess?.(itemId);
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      setStatus('error');
      const msg = (err as { response?: { data?: { msg?: string } } })
        ?.response?.data?.msg ?? 'حدث خطأ، حاول مجدداً';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [itemId, isLoading, onSuccess]);

  return {
    status,
    isLoading,
    errorMsg,
    confirmReceipt:  () => sendConfirmation('recipient_confirm'),
    confirmDelivery: () => sendConfirmation('donor_confirm'),
    canConfirm: !isLoading && status !== 'completed' && (
      (userRole === 'recipient' && (status === 'idle' || status === 'error')) ||
      (userRole === 'donor'     && status === 'waiting_donor')
    ),
  };
}