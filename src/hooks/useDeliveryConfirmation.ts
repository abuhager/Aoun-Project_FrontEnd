// src/hooks/useDeliveryConfirmation.ts
// [FIX-5] useEffect يُحدّث status عند تغيّر initialRecipientConfirmed من خارجي
'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSocket }        from '@/hooks/useSocket';
import { completeDelivery } from '@/lib/api/itemApi';
import toast from 'react-hot-toast';

type ConfirmationType = 'recipient_confirm' | 'donor_confirm';
type DeliveryStatus   = 'idle'|'recipient_confirming'|'waiting_donor'|'donor_confirming'|'completed'|'error';

interface Props  { itemId:string; userRole:'donor'|'recipient'; initialRecipientConfirmed?:boolean; onSuccess?:(id:string)=>void; }
interface Return { status:DeliveryStatus; isLoading:boolean; errorMsg:string|null; confirmReceipt:()=>Promise<void>; confirmDelivery:()=>Promise<void>; canConfirm:boolean; }

export function useDeliveryConfirmation({ itemId, userRole, initialRecipientConfirmed=false, onSuccess }: Props): Return {
  const socketRef = useSocket();
  const [status,    setStatus]  = useState<DeliveryStatus>(initialRecipientConfirmed ? 'waiting_donor' : 'idle');
  const [isLoading, setLoading] = useState(false);
  const [errorMsg,  setErrorMsg]= useState<string|null>(null);

  // [FIX-5] مزامنة الـ status مع initialRecipientConfirmed عند تغيّره
  const prevRef = useRef(initialRecipientConfirmed);
  useEffect(() => {
    if (initialRecipientConfirmed !== prevRef.current && initialRecipientConfirmed === true) {
      setStatus((prev) => (prev === 'idle' || prev === 'error') ? 'waiting_donor' : prev);
    }
    prevRef.current = initialRecipientConfirmed;
  }, [initialRecipientConfirmed]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onRC = (d:{itemId:string;message:string}) => { if(d.itemId!==itemId) return; setStatus('waiting_donor'); toast.success(d.message??'المستلم أكّد الاستلام ✅'); };
    const onC  = (d:{itemId:string;message:string}) => { if(d.itemId!==itemId) return; setStatus('completed'); toast.success(d.message??'تم التسليم 🎉'); onSuccess?.(itemId); };
    socket.on('delivery:recipient_confirmed',onRC);
    socket.on('delivery:completed',onC);
    return () => { socket.off('delivery:recipient_confirmed',onRC); socket.off('delivery:completed',onC); };
  }, [socketRef,itemId,onSuccess]);

  const sendConfirmation = useCallback(async (type:ConfirmationType) => {
    if(isLoading) return;
    setLoading(true); setErrorMsg(null);
    const prev = status;
    setStatus(type==='recipient_confirm'?'recipient_confirming':'donor_confirming');
    try {
      const data = await completeDelivery(itemId,type);
      if(type==='recipient_confirm') { setStatus('waiting_donor'); toast.success(data.msg??'تم التأكيد ✅'); }
      else { setStatus('completed'); toast.success(data.msg??'تم التسليم 🎉'); onSuccess?.(itemId); }
    } catch(err:unknown) {
      setStatus(prev);
      const msg=(err as {response?:{data?:{msg?:string}}})?.response?.data?.msg??'حدث خطأ';
      setErrorMsg(msg); toast.error(msg);
    } finally { setLoading(false); }
  },[itemId,isLoading,status,onSuccess]);

  return {
    status, isLoading, errorMsg,
    confirmReceipt:  ()=>sendConfirmation('recipient_confirm'),
    confirmDelivery: ()=>sendConfirmation('donor_confirm'),
    canConfirm: !isLoading && status!=='completed' && (
      (userRole==='recipient' && (status==='idle'||status==='error')) ||
      (userRole==='donor'     && status==='waiting_donor')
    ),
  };
}
