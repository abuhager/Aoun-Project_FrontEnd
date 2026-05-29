// src/hooks/useDeliveryConfirmation.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import axiosInstance from '@/lib/api/axiosInstance';
import toast from 'react-hot-toast';

type ConfirmationType = 'recipient_confirm' | 'donor_confirm';

type DeliveryStatus =
  | 'idle'
  | 'recipient_confirming'
  | 'waiting_donor'
  | 'donor_confirming'
  | 'completed'
  | 'error';

interface UseDeliveryConfirmationProps {
  itemId: string;
  userRole: 'donor' | 'recipient';
  initialRecipientConfirmed?: boolean; // ✅ جديد — نمرره من الـ item
  onSuccess?: (itemId: string) => void;
}

interface UseDeliveryConfirmationReturn {
  status: DeliveryStatus;
  isLoading: boolean;
  errorMsg: string | null;
  confirmReceipt: () => Promise<void>;
  confirmDelivery: () => Promise<void>;
  canConfirm: boolean;
}

export function useDeliveryConfirmation({
  itemId,
  userRole,
  initialRecipientConfirmed = false,
  onSuccess,
}: UseDeliveryConfirmationProps): UseDeliveryConfirmationReturn {
  const socketRef = useSocket();

  // ✅ إذا المستلم كان قد أكّد مسبقاً (من DB)، نبدأ بـ waiting_donor
  const [status, setStatus] = useState<DeliveryStatus>(
    initialRecipientConfirmed ? 'waiting_donor' : 'idle'
  );
  const [isLoading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Socket listeners ──────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onRecipientConfirmed = (data: { itemId: string; message: string }) => {
      if (data.itemId !== itemId) return;
      setStatus('waiting_donor');
      toast.success(data.message ?? 'المستلم أكّد الاستلام — يمكنك الآن تأكيد التسليم ✅');
    };

    const onCompleted = (data: { itemId: string; message: string }) => {
      if (data.itemId !== itemId) return;
      setStatus('completed');
      toast.success(data.message ?? 'تم التسليم بنجاح 🎉');
      onSuccess?.(itemId);
    };

    socket.on('delivery:recipient_confirmed', onRecipientConfirmed);
    socket.on('delivery:completed', onCompleted);

    return () => {
      socket.off('delivery:recipient_confirmed', onRecipientConfirmed);
      socket.off('delivery:completed', onCompleted);
    };
  }, [socketRef, itemId, onSuccess]);

  // ── API call ──────────────────────────────────────────────
  const sendConfirmation = useCallback(
    async (confirmationType: ConfirmationType) => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data } = await axiosInstance.put(`/api/items/complete/${itemId}`, {
          confirmationType,
        });

        if (confirmationType === 'recipient_confirm') {
          setStatus('waiting_donor');
          toast.success(data.msg ?? 'تم تأكيد الاستلام ✅');
        } else {
          setStatus('completed');
          toast.success(data.msg ?? 'تم التسليم بنجاح 🎉');
          onSuccess?.(itemId);
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ??
          'حدث خطأ — حاول مرة أخرى';
        const code =
          (err as { response?: { data?: { code?: string } } })?.response?.data?.code;

        setErrorMsg(msg);
        setStatus('error');

        if (code === 'RECIPIENT_NOT_CONFIRMED') {
          toast.error('في انتظار تأكيد المستلم أولاً ⏳');
        } else {
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [itemId, onSuccess]
  );

  const confirmReceipt = () => sendConfirmation('recipient_confirm');
  const confirmDelivery = () => sendConfirmation('donor_confirm');

  // ✅ المتبرع يقدر يضغط فقط إذا المستلم أكّد (waiting_donor)
  const canConfirm =
    !isLoading &&
    status !== 'completed' &&
    (
      (userRole === 'recipient' && (status === 'idle' || status === 'error')) ||
      (userRole === 'donor' && status === 'waiting_donor')
    );

  return { status, isLoading, errorMsg, confirmReceipt, confirmDelivery, canConfirm };
}