"use client";

import { useState } from "react";
import { createReport } from "@/lib/api/reportApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { useSettings } from "@/hooks/useSettings";
import {
  REPORT_REASONS_FALLBACK as REPORT_REASONS,
  type ReportReason,
} from "@/types/report.types";
import AccessibleDialog from "@/components/ui/AccessibleDialog";

interface Props {
  reportedUserId: string;
  reportedUserName: string;
  itemId?: string;
  onClose: () => void;
}

export default function ReportModal({
  reportedUserId,
  reportedUserName,
  itemId,
  onClose,
}: Props) {
  const { reportReasons } = useSettings();
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const reasons = reportReasons.length > 0 ? reportReasons : REPORT_REASONS;

  const handleSubmit = async () => {
    if (!reason) {
      setErrorMsg("اختر سبب البلاغ أولاً");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      await createReport({
        reportedUserId,
        itemId,
        reason,
        details: details.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err: unknown) {
      setErrorMsg(extractErrorMsg(err, "حدث خطأ، حاول مرة أخرى"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccessibleDialog
      ariaLabel={`الإبلاغ عن ${reportedUserName}`}
      onClose={onClose}
      closeDisabled={loading}
      ariaBusy={loading}
      overlayClassName="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
      panelClassName="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
    >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#191c1d]">
            الإبلاغ عن <span className="text-red-500">{reportedUserName}</span>
          </h3>

          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            type="button"
            aria-label="إغلاق"
            className="touch-target flex items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center" role="status" aria-live="polite">
            <span className="material-symbols-outlined text-5xl text-green-500">
              check_circle
            </span>
            <p className="mt-3 font-bold text-green-600">تم إرسال البلاغ ✅</p>
            <p className="mt-1 text-xs text-gray-400">سيتم مراجعته من الإدارة</p>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-medium text-gray-500">سبب البلاغ *</p>

            <div className="mb-4 flex flex-col gap-2" role="radiogroup" aria-label="سبب البلاغ">
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={reason === r}
                  onClick={() => {
                    setReason(r);
                    if (errorMsg) setErrorMsg("");
                  }}
                  className={`rounded-2xl border px-4 py-3 text-right text-sm transition-all ${
                    reason === r
                      ? "border-red-400 bg-red-50 font-bold text-red-600"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              maxLength={1000}
              rows={3}
              placeholder="تفاصيل إضافية (اختياري)"
              aria-label="تفاصيل إضافية للبلاغ"
              className="mb-4 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />

            <p className="mb-3 text-left text-[10px] text-gray-400">
              {details.length}/1000
            </p>

            {errorMsg && (
              <p role="alert" className="mb-3 text-xs font-bold text-red-500">{errorMsg}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !reason}
              className="w-full rounded-2xl bg-red-500 py-4 font-bold text-white transition-opacity disabled:opacity-50"
            >
              {loading ? "جاري الإرسال..." : "إرسال البلاغ"}
            </button>
          </>
        )}
    </AccessibleDialog>
  );
}
