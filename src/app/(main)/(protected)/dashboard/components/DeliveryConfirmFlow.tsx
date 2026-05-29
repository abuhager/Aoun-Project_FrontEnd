// src/app/(main)/(protected)/dashboard/components/DeliveryConfirmFlow.tsx
// ✅ يستبدل OtpModal — Double Confirmation بدون OTP
"use client";

interface DeliveryConfirmFlowProps {
  item:           { _id: string; title: string; recipientConfirmed?: boolean };
  role:           'recipient' | 'donor';
  loading:        boolean;
  onConfirm:      (itemId: string) => void;
  waitingDonor?:  boolean; // المستلم أكّد وننتظر المتبرع
}

export function DeliveryConfirmFlow({
  item, role, loading, onConfirm, waitingDonor = false,
}: DeliveryConfirmFlowProps) {

  // ── المستلم: لم يؤكد بعد ──────────────────────────────────
  if (role === 'recipient' && !item.recipientConfirmed) {
    return (
      <button
        onClick={() => onConfirm(item._id)}
        disabled={loading}
        className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50
                   text-white text-xs font-black px-3 py-1.5 rounded-xl transition-colors"
      >
        {loading
          ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
          : <span className="material-symbols-outlined text-sm">check_circle</span>
        }
        {loading ? 'جارٍ...' : 'تأكيد الاستلام'}
      </button>
    );
  }

  // ── المستلم: أكّد وينتظر ─────────────────────────────────
  if (role === 'recipient' && item.recipientConfirmed) {
    return (
      <span className="flex items-center gap-1.5 text-amber-600 text-xs font-bold bg-amber-50
                       border border-amber-200 px-3 py-1.5 rounded-xl">
        <span className="material-symbols-outlined text-sm">schedule</span>
        في انتظار المتبرع…
      </span>
    );
  }

  // ── المتبرع: ينتظر تأكيد المستلم ────────────────────────
  if (role === 'donor' && !waitingDonor) {
    return (
      <span className="flex items-center gap-1.5 text-gray-400 text-xs font-bold bg-gray-50
                       border border-gray-200 px-3 py-1.5 rounded-xl">
        <span className="material-symbols-outlined text-sm">schedule</span>
        في انتظار المستلم…
      </span>
    );
  }

  // ── المتبرع: المستلم أكّد، دوره الآن ─────────────────────
  if (role === 'donor' && waitingDonor) {
    return (
      <button
        onClick={() => onConfirm(item._id)}
        disabled={loading}
        className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50
                   text-white text-xs font-black px-3 py-1.5 rounded-xl transition-colors
                   animate-pulse"
      >
        {loading
          ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
          : <span className="material-symbols-outlined text-sm">local_shipping</span>
        }
        {loading ? 'جارٍ...' : 'تأكيد التسليم ✅'}
      </button>
    );
  }

  return null;
}
