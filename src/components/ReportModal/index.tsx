"use client";

import { useState } from "react";
import { createReport } from "@/lib/api/reportApi";
import { REPORT_REASONS, type ReportReason } from "@/types/report.types";

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
  const [reason,   setReason]   = useState<ReportReason | "">("");
  const [details,  setDetails]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async () => {
    if (!reason) { setErrorMsg("اختر سبب البلاغ أولاً"); return; }

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
      const msg = (err as { response?: { data?: { msg?: string } } })
        ?.response?.data?.msg;
      setErrorMsg(msg || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#191c1d]">
            الإبلاغ عن{" "}
            <span className="text-red-500">{reportedUserName}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-5xl text-green-500">
              check_circle
            </span>
            <p className="mt-3 font-bold text-green-600">تم إرسال البلاغ ✅</p>
            <p className="text-xs text-gray-400 mt-1">سيتم مراجعته من الإدارة</p>
          </div>
        ) : (
          <>
            {/* سبب البلاغ */}
            <p className="text-xs text-gray-500 mb-2 font-medium">سبب البلاغ *</p>
            <div className="flex flex-col gap-2 mb-4">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-right text-sm px-4 py-3 rounded-2xl border transition-all ${
                    reason === r
                      ? "border-red-400 bg-red-50 text-red-600 font-bold"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* تفاصيل إضافية */}
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="تفاصيل إضافية (اختياري)"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none mb-4 focus:outline-none focus:border-primary"
            />

            {errorMsg && (
              <p className="text-xs text-red-500 font-bold mb-3">{errorMsg}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !reason}
              className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-opacity"
            >
              {loading ? "جاري الإرسال..." : "إرسال البلاغ"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}