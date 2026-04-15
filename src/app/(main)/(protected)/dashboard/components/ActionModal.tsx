interface ActionModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  isDanger?: boolean;
}

export function ActionModal({
  message, onConfirm, onCancel,
  confirmText = "تأكيد", isDanger = false,
}: ActionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100">
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-orange-500">warning</span>
        </div>
        <p className="text-sm font-bold text-[#191c1d] leading-relaxed text-center whitespace-pre-line">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 ${isDanger ? "bg-red-500" : "bg-primary"} text-white py-3 rounded-2xl font-black text-xs hover:opacity-90 transition-all`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all"
          >
            تراجع
          </button>
        </div>
      </div>
    </div>
  );
}