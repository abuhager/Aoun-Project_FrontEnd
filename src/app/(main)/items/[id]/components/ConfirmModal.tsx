// ─── Modal التأكيد المنفصل ───
interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export function ConfirmModal({ message, onConfirm, onCancel, isDanger = false }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl space-y-4 border border-gray-100">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${isDanger ? "bg-red-50" : "bg-orange-50"}`}>
          <span className={`material-symbols-outlined ${isDanger ? "text-red-500" : "text-orange-500"}`}>
            {isDanger ? "warning" : "help_outline"}
          </span>
        </div>
        <p className="text-sm font-bold text-[#191c1d] leading-relaxed text-center whitespace-pre-line">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-3 rounded-2xl font-black text-sm transition-all ${isDanger ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
          >
            تأكيد
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}