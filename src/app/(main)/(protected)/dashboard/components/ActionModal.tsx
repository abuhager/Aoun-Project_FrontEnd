"use client";

import AccessibleDialog from "@/components/ui/AccessibleDialog";

interface ActionModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  isDanger?: boolean;
}

export function ActionModal({
  message,
  onConfirm,
  onCancel,
  confirmText = "تأكيد",
  isDanger = false,
}: ActionModalProps) {
  return (
    <AccessibleDialog
      ariaLabel={isDanger ? "تأكيد إجراء خطر" : "تأكيد الإجراء"}
      onClose={onCancel}
      role="alertdialog"
      overlayClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      panelClassName="w-full max-w-sm overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-2xl shadow-black/[0.15]"
    >
        {/* أيقونة التحذير */}
        <div className="flex justify-center px-6 pt-6 pb-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl
                        ${isDanger ? "bg-red-50" : "bg-orange-50"}`}
          >
            <span
              className={`material-symbols-outlined text-[26px]
                          ${isDanger ? "text-red-500" : "text-orange-500"}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isDanger ? "delete_forever" : "warning"}
            </span>
          </div>
        </div>

        {/* الرسالة */}
        <p
          className="px-6 pb-6 text-center text-sm font-bold
                     leading-relaxed text-gray-700 whitespace-pre-line"
        >
          {message}
        </p>

        {/* الأزرار */}
        <div className="flex gap-2 border-t border-black/[0.06] p-4">
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm
                       font-black text-gray-600 transition-all duration-150
                       hover:bg-gray-200 active:scale-95"
          >
            تراجع
          </button>
          <button
            onClick={onConfirm}
            type="button"
            data-dialog-initial-focus={!isDanger ? "true" : undefined}
            className={`flex-1 rounded-xl py-2.5 text-sm font-black text-white
                        shadow-md transition-all duration-150 active:scale-95
                        ${isDanger
                          ? "bg-red-500 shadow-red-500/25 hover:bg-red-600 hover:shadow-red-500/35"
                          : "bg-primary shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30"
                        }`}
          >
            {confirmText}
          </button>
        </div>
    </AccessibleDialog>
  );
}
