// src/components/AppealModal/index.tsx
"use client";

import { useState } from "react";
import { submitAppeal } from "@/lib/api/reportApi";

interface Props {
  reportId: string;
  onClose:  () => void;
}

export default function AppealModal({ reportId, onClose }: Props) {
  const [appealText, setAppealText] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState("");
  const [success,    setSuccess]    = useState(false);

  const handleSubmit = async () => {
    if (!appealText.trim()) { setErrorMsg("اكتب رسالة الاعتراض أولاً"); return; }

    setErrorMsg("");
    setLoading(true);
    try {
      await submitAppeal(reportId, { appealText: appealText.trim() });
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

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#191c1d]">
            الاعتراض على البلاغ
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
            <p className="mt-3 font-bold text-green-600">تم إرسال اعتراضك ✅</p>
            <p className="text-xs text-gray-400 mt-1">ستراجعه الإدارة قريباً</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-2 font-medium">
              اشرح سبب اعتراضك على هذا البلاغ *
            </p>
            <textarea
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="اكتب توضيحك هنا..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none mb-1 focus:outline-none focus:border-primary"
            />
            <p className="text-[10px] text-gray-400 text-left mb-4">
              {appealText.length}/1000
            </p>

            {errorMsg && (
              <p className="text-xs text-red-500 font-bold mb-3">{errorMsg}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !appealText.trim()}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-opacity"
            >
              {loading ? "جاري الإرسال..." : "إرسال الاعتراض"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}