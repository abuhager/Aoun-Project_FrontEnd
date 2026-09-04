import AccessibleDialog from "@/components/ui/AccessibleDialog";
import {
  ADMIN_USER_ACTION_LABELS,
  type PendingUserAction,
} from "../hooks/useAdminUsers";

type UserActionDialogProps = {
  action: PendingUserAction;
  note: string;
  busy: boolean;
  onNoteChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export default function UserActionDialog({
  action,
  note,
  busy,
  onNoteChange,
  onConfirm,
  onClose,
}: UserActionDialogProps) {
  if (!action) return null;
  const labels = ADMIN_USER_ACTION_LABELS[action.type];
  const noteLabel = action.type === "ban" ? "سبب الحظر" : "ملاحظة إدارية";

  return (
    <AccessibleDialog
      ariaLabel={labels.title}
      onClose={onClose}
      closeDisabled={busy}
      role="alertdialog"
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1815]/45 p-4 backdrop-blur-sm"
      panelClassName="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[30px] border border-white/50 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:p-6"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${labels.tone}`}>
          <span className="material-symbols-outlined text-[22px]">{labels.icon}</span>
        </div>
        <div>
          <h2 className="text-base font-black text-[#1f312f]">{labels.title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#7c766f]">
            المستخدم: <span className="font-black text-[#263735]">{action.userName}</span>
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="admin-user-action-note" className="block text-xs font-extrabold text-[#8a837b]">
          {noteLabel}{" "}
          {action.type === "ban" ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="font-normal">(اختياري)</span>
          )}
        </label>
        <textarea
          id="admin-user-action-note"
          rows={4}
          maxLength={500}
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder={
            action.type === "ban"
              ? "اكتب سبب الحظر (5 أحرف على الأقل)..."
              : "أدخل سبب الإجراء أو أي ملاحظة داخلية..."
          }
          className="w-full rounded-2xl border border-[#e7e1d8] bg-[#fcfaf7] px-4 py-3 text-sm text-[#24302f] outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
        />
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`flex-1 rounded-2xl py-3 text-sm font-black transition-all duration-300 disabled:opacity-50 ${labels.buttonClassName}`}
        >
          {busy ? "جاري التنفيذ..." : labels.button}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="flex-1 rounded-2xl bg-[#f3f0ea] py-3 text-sm font-black text-[#5f5a54] transition-all duration-300 hover:bg-[#eae5dd] disabled:opacity-50"
        >
          إلغاء
        </button>
      </div>
    </AccessibleDialog>
  );
}
