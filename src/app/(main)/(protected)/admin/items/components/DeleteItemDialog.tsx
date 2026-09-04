import AccessibleDialog from "@/components/ui/AccessibleDialog";
import type { PendingItemDelete } from "../hooks/useAdminItems";

type DeleteItemDialogProps = {
  item: PendingItemDelete;
  note: string;
  busy: boolean;
  onNoteChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeleteItemDialog({
  item,
  note,
  busy,
  onNoteChange,
  onConfirm,
  onClose,
}: DeleteItemDialogProps) {
  if (!item) return null;

  return (
    <AccessibleDialog
      ariaLabel="تأكيد حذف الغرض"
      onClose={onClose}
      closeDisabled={busy}
      role="alertdialog"
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm"
      panelClassName="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[30px] border border-white/30 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:p-6"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <span className="material-symbols-outlined text-[22px]">delete</span>
        </div>
        <div>
          <h2 className="text-base font-black text-[#1f312f]">تأكيد حذف الغرض</h2>
          <p className="mt-1 text-sm leading-6 text-[#7c766f]">
            الغرض: <span className="font-black text-[#263735]">{item.title}</span>
          </p>
          {item.donorName && (
            <p className="text-sm leading-6 text-[#7c766f]">
              صاحب الغرض:{" "}
              <span className="font-bold text-[#263735]">{item.donorName}</span>
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="delete-item-note" className="block text-xs font-extrabold text-[#8a837b]">
          تعليق الحذف <span className="text-red-500">*</span>
        </label>
        <textarea
          id="delete-item-note"
          rows={4}
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="اكتب سبب حذف الغرض..."
          className="w-full resize-none rounded-2xl border border-[#e7e1d8] bg-[#fcfaf7] px-4 py-3 text-sm text-[#24302f] outline-none transition-colors placeholder:text-[#b3aba1] focus:border-primary"
        />
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-black text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {busy ? "جاري الحذف..." : "تأكيد الحذف"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="flex-1 rounded-2xl bg-[#f3f0ea] py-3 text-sm font-black text-[#5f5a54] transition-colors hover:bg-[#eae5dd] disabled:opacity-50"
        >
          إلغاء
        </button>
      </div>
    </AccessibleDialog>
  );
}
