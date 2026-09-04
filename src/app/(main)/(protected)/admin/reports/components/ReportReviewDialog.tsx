import AccessibleDialog from "@/components/ui/AccessibleDialog";
import type {
  ModerationReport,
  ReportDecision,
} from "@/types/report.types";
import {
  getReportUserName,
  REPORT_STATUS_LABELS,
} from "../reportPresentation";

type ReportReviewDialogProps = {
  report: ModerationReport | null;
  adminNote: string;
  actionStatus: ReportDecision;
  submitting: boolean;
  onAdminNoteChange: (value: string) => void;
  onActionStatusChange: (status: ReportDecision) => void;
  onResolve: () => void;
  onClose: () => void;
};

export default function ReportReviewDialog({
  report,
  adminNote,
  actionStatus,
  submitting,
  onAdminNoteChange,
  onActionStatusChange,
  onResolve,
  onClose,
}: ReportReviewDialogProps) {
  if (!report) return null;

  return (
    <AccessibleDialog
      ariaLabel="تفاصيل البلاغ واتخاذ الإجراء"
      onClose={onClose}
      closeDisabled={submitting}
      ariaBusy={submitting}
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      panelClassName="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/20 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
    >
      <div className="flex items-center justify-between border-b border-[#f0ebe4] px-6 py-5">
        <div>
          <h2 className="text-lg font-black text-[#1f312f]">تفاصيل البلاغ</h2>
          <p className="mt-1 text-xs text-[#938b82]">
            مراجعة الحالة والبت فيها من نفس النافذة
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f1eb] text-[#6e6860] transition-colors hover:bg-[#ece6de] disabled:opacity-50"
          aria-label="إغلاق"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="space-y-5 px-6 py-6">
        {report.totalReportsAgainstUser > 0 && (
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                report.isRepeatOffender
                  ? "bg-red-50 text-red-700"
                  : "bg-[#f3f0ea] text-[#6a655f]"
              }`}
            >
              {report.totalReportsAgainstUser} بلاغ إجمالي ضد هذا المستخدم
            </span>
            {report.pendingReportsAgainstUser > 0 && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                {report.pendingReportsAgainstUser} بلاغ قيد المراجعة
              </span>
            )}
            {report.actionedReportsAgainstUser > 0 && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                {report.actionedReportsAgainstUser} بلاغ معتمد
              </span>
            )}
            {report.isRepeatOffender && (
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                مخالف متكرر
              </span>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#ebe4db] bg-[#faf8f4] p-4">
            <p className="mb-1 text-xs font-bold text-[#9b948c]">المُبلِّغ</p>
            <p className="text-sm font-black text-[#223433]">
              {getReportUserName(report.reporter?.name)}
            </p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="mb-1 text-xs font-bold text-[#b88a8a]">المُبلَّغ عنه</p>
            <p className="text-sm font-black text-red-700">
              {getReportUserName(report.reportedUser?.name)}
            </p>
            {report.reportedUser?.isBanned && (
              <span className="mt-1 inline-block text-xs font-bold text-red-500">
                محظور حالياً
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-extrabold text-[#8f877f]">السبب</p>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-[#5b5147]">
            {report.reason}
          </div>
        </div>

        {report.details && (
          <div>
            <p className="mb-2 text-xs font-extrabold text-[#8f877f]">تفاصيل إضافية</p>
            <div className="whitespace-pre-wrap break-words rounded-2xl border border-[#ebe4db] bg-[#faf8f4] px-4 py-3 text-sm leading-7 text-[#5e5953]">
              {report.details}
            </div>
          </div>
        )}

        {report.appealText && (
          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
            <p className="mb-1 text-xs font-extrabold text-orange-700">طعن المستخدم</p>
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#5f5952]">
              {report.appealText}
            </p>
          </div>
        )}

        {report.relatedItem && (
          <div className="rounded-2xl border border-[#ebe4db] bg-white px-4 py-3 text-sm text-[#5f5a54]">
            <span className="font-black text-[#223433]">الغرض المرتبط: </span>
            {report.relatedItem.title}
          </div>
        )}

        {report.status === "pending" && (
          <div className="space-y-4 border-t border-[#f0ebe4] pt-5">
            <p className="text-sm font-black text-[#223433]">اتخاذ إجراء</p>
            <div>
              <label htmlFor="report-decision" className="mb-2 block text-xs font-bold text-[#8c857d]">
                نوع الإجراء
              </label>
              <select
                id="report-decision"
                value={actionStatus}
                onChange={(event) =>
                  onActionStatusChange(event.target.value as ReportDecision)
                }
                className="w-full rounded-2xl border border-[#e4ddd4] bg-[#fcfaf7] px-4 py-3 text-sm font-bold text-[#233433] outline-none transition-colors focus:border-primary"
              >
                <option value="actioned">{REPORT_STATUS_LABELS.actioned}</option>
                <option value="reviewed">{REPORT_STATUS_LABELS.reviewed}</option>
                <option value="dismissed">{REPORT_STATUS_LABELS.dismissed}</option>
              </select>
            </div>

            <div>
              <label htmlFor="report-admin-note" className="mb-2 block text-xs font-bold text-[#8c857d]">
                ملاحظة المشرف <span className="text-red-500">*</span>
              </label>
              <textarea
                id="report-admin-note"
                value={adminNote}
                onChange={(event) => onAdminNoteChange(event.target.value)}
                rows={4}
                maxLength={500}
                placeholder="اكتب ملاحظتك هنا..."
                className="w-full resize-none rounded-2xl border border-[#e4ddd4] bg-[#fcfaf7] px-4 py-3 text-sm text-[#24302f] outline-none transition-colors placeholder:text-[#b3aba1] focus:border-primary"
              />
              <p className="mt-1 text-left text-xs text-[#aaa29a]">{adminNote.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onResolve}
                disabled={submitting || !adminNote.trim()}
                className="flex-1 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "جارٍ التنفيذ..." : "تأكيد الإجراء"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-2xl border border-[#e2ddd5] px-5 py-3 text-sm font-bold text-[#66615b] transition-colors hover:bg-[#faf8f4] disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {report.status !== "pending" && report.adminNote && (
          <div className="border-t border-[#f0ebe4] pt-4">
            <p className="mb-2 text-xs font-extrabold text-[#8f877f]">ملاحظة المشرف</p>
            <div className="whitespace-pre-wrap break-words rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-7 text-[#505d6c]">
              {report.adminNote}
            </div>
          </div>
        )}
      </div>
    </AccessibleDialog>
  );
}
