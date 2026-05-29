// src/components/DeliveryConfirmButton.tsx
// ✅ زر تأكيد التسليم/الاستلام — Double Confirmation UI

'use client';

import React from 'react';
import { useDeliveryConfirmation } from '@/hooks/useDeliveryConfirmation';

interface DeliveryConfirmButtonProps {
  itemId:    string;
  userRole:  'donor' | 'recipient';
  onSuccess?: (itemId: string) => void;
  className?: string;
}

const statusLabels = {
  idle:                 { recipient: 'تأكيد الاستلام ✅',     donor: 'تأكيد التسليم ✅'     },
  recipient_confirming: { recipient: 'جارٍ التأكيد...',       donor: 'انتظر...'              },
  waiting_donor:        { recipient: 'تم التأكيد ✅ — انتظار المتبرع', donor: 'تأكيد التسليم النهائي ✅' },
  donor_confirming:     { recipient: 'انتظر...',              donor: 'جارٍ التأكيد...'      },
  completed:            { recipient: 'تم التسليم 🎉',         donor: 'تم التسليم 🎉'         },
  error:                { recipient: 'إعادة المحاولة',        donor: 'إعادة المحاولة'       },
};

export default function DeliveryConfirmButton({
  itemId,
  userRole,
  onSuccess,
  className = '',
}: DeliveryConfirmButtonProps) {
  const { status, isLoading, errorMsg, confirmReceipt, confirmDelivery, canConfirm } =
    useDeliveryConfirmation({ itemId, userRole, onSuccess });

  const handleClick = () => {
    if (userRole === 'recipient') confirmReceipt();
    else                          confirmDelivery();
  };

  const label = statusLabels[status]?.[userRole] ?? 'تأكيد';

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={!canConfirm || isLoading}
        className={[
          'px-4 py-2 rounded-lg font-medium transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          status === 'completed'
            ? 'bg-green-100 text-green-700 cursor-default'
            : 'bg-green-600 hover:bg-green-700 text-white',
          className,
        ].join(' ')}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> جارٍ التأكيد...
          </span>
        ) : (
          label
        )}
      </button>

      {/* حالة الانتظار — للمتبرع */}
      {userRole === 'donor' && status === 'idle' && (
        <p className="text-xs text-gray-500 text-center">
          في انتظار تأكيد المستلم أولاً
        </p>
      )}

      {/* رسالة خطأ */}
      {errorMsg && status === 'error' && (
        <p className="text-xs text-red-500 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
