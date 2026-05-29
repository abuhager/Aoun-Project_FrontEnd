// src/hooks/useDeliveryConfirmation.ts
// ✅ Hook يدير Double Confirmation Flow بدون OTP

import { useState, useCallback }  from 'react';
import { useSocket }               from '@/hooks/useSocket';
import { useEffect }               from 'react';
import axiosInstance               from '@/lib/api/axiosInstance';
import toast                       from 'react-hot-toast';

type ConfirmationType = 'recipient_confirm' | 'donor_confirm';

type DeliveryStatus =
  | 'idle'
  | 'recipient_confirming'
  | 'waiting_donor'
  | 'donor_confirming'
  | 'completed'
  | 'error';

interface UseDeliveryConfirmationProps {
  itemId:    string;
  userRole:  'donor' | 'recipient';
  onSuccess?: (itemId: string) => void;
}

interface UseDeliveryConfirmationReturn {
  status:          DeliveryStatus;
  isLoading:       boolean;
  errorMsg:        string | null;
  confirmReceipt:  () => Promise<void>;   // للمستلم
  confirmDelivery: () => Promise<void>;   // للمتبرع
  canConfirm:      boolean;               // هل الزر مفعّل
}

export function useDeliveryConfirmation({
  itemId,
  userRole,
  onSuccess,
}: UseDeliveryConfirmationProps): UseDeliveryConfirmationReturn {
  const socketRef = useSocket();
  const [status,    setStatus]   = useState<DeliveryStatus>('idle');
  const [isLoading, setLoading]  = useState(false);
  const [errorMsg,  setErrorMsg] = useState<string | null>(null);

  // ── استمع لأحداث Socket.io ────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // المتبرع يسمع أن المستلم أكّد
    const onRecipientConfirmed = (data: { itemId: string; message: string }) => {
      if (data.itemId !== itemId) return;
      setStatus('waiting_donor');
      toast.success(data.message ?? 'المستلم أكّد الاستلام — يمكنك الآن تأكيد التسليم ✅');
    };

    // المستلم يسمع أن التسليم اكتمل
    const onCompleted = (data: { itemId: string; message: string }) => {
      if (data.itemId !== itemId) return;
      setStatus('completed');
      toast.success(data.message ?? 'تم التسليم بنجاح 🎉');
      onSuccess?.(itemId);
    };

    socket.on('delivery:recipient_confirmed', onRecipientConfirmed);
    socket.on('delivery:completed',           onCompleted);

    return () => {
      socket.off('delivery:recipient_confirmed', onRecipientConfirmed);
      socket.off('delivery:completed',           onCompleted);
    };
  }, [socketRef, itemId, onSuccess]);

  // ── API call مشترك ────────────────────────────────────────
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
          (err as { response?: { data?: { msg?: string; code?: string } } })
            ?.response?.data?.msg ?? 'حدث خطأ — حاول مرة أخرى';
        const code =
          (err as { response?: { data?: { code?: string } } })
            ?.response?.data?.code;

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

  const confirmReceipt  = () => sendConfirmation('recipient_confirm');
  const confirmDelivery = () => sendConfirmation('donor_confirm');

  // هل يمكن للمستخدم الضغط؟
  const canConfirm =
    !isLoading &&
    status !== 'completed' &&
    (
      (userRole === 'recipient' && status === 'idle') ||
      (userRole === 'donor'     && (status === 'idle' || status === 'waiting_donor'))
    );

  return { status, isLoading, errorMsg, confirmReceipt, confirmDelivery, canConfirm };
}
