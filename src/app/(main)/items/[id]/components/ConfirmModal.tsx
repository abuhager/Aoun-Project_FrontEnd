"use client";

import AccessibleDialog from "@/components/ui/AccessibleDialog";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export function ConfirmModal({ message, onConfirm, onCancel, isDanger = false }: ConfirmModalProps) {
  return (
    <AccessibleDialog
      ariaLabel={isDanger ? "تأكيد إجراء خطر" : "تأكيد الإجراء"}
      onClose={onCancel}
      role="alertdialog"
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      panelClassName="w-full max-w-sm space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl sm:p-6"
    >
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
            type="button"
            className={`flex-1 text-white py-3 rounded-2xl font-black text-sm transition-all ${isDanger ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
          >
            تأكيد
          </button>
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
          >
            إلغاء
          </button>
        </div>
    </AccessibleDialog>
  );
}
