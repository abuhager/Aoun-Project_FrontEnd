// src/components/DeliveryConfirmButton.tsx
'use client';

import React from 'react';
import { useDeliveryConfirmation } from '@/hooks/useDeliveryConfirmation';

interface DeliveryConfirmButtonProps {
  itemId: string;
  userRole: 'donor' | 'recipient';
  initialRecipientConfirmed?: boolean; // ✅ جديد
  onSuccess?: (itemId: string) => void;
  className?: string;
}

const buttonLabel: Record<string, Record<string, string>> = {
  idle:                 { recipient: 'تأكيد الاستلام ✅',              donor: 'في انتظار تأكيد المستلم ⏳' },
  recipient_confirming: { recipient: 'جارٍ التأكيد...',                donor: 'انتظر...'                  },
  waiting_donor:        { recipient: 'تم تأكيد استلامك ✅',            donor: 'تأكيد التسليم النهائي ✅'   },
  donor_confirming:     { recipient: 'انتظر...',                       donor: 'جارٍ التأكيد...'            },
  completed:            { recipient: 'تم التسليم بنجاح 🎉',            donor: 'تم التسليم بنجاح 🎉'         },
  error:                { recipient: 'إعادة المحاولة',                 donor: 'إعادة المحاولة'             },
};

export default function DeliveryConfirmButton({
  itemId,
  userRole,
  initialRecipientConfirmed = false,
  onSuccess,
  className = '',
}: DeliveryConfirmButtonProps) {
  const { status, isLoading, errorMsg, confirmReceipt, confirmDelivery, canConfirm } =
    useDeliveryConfirmation({ itemId, userRole, initialRecipientConfirmed, onSuccess });

  const handleClick = () => {
    if (userRole === 'recipient') confirmReceipt();
    else confirmDelivery();
  };

  const label = buttonLabel[status]?.[userRole] ?? 'تأكيد';
  const isCompleted = status === 'completed';

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={!canConfirm || isLoading}
        className={[
          'px-4 py-2 rounded-lg font-medium transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isCompleted
            ? 'bg-green-100 text-green-700 cursor-default'
            : canConfirm
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed',
          className,
        ].join(' ')}
      >
        {isLoading ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="animate-spin inline-block">⏳</span>
            جارٍ التأكيد...
          </span>
        ) : (
          label
        )}
      </button>

      {/* رسالة خطأ */}
      {errorMsg && status === 'error' && (
        <p className="text-xs text-red-500 text-center">{errorMsg}</p>
      )}
    </div>
  );
}