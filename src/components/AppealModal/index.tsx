// src/components/AppealModal/index.tsx
"use client";

import { useState } from "react";
import axiosInstance from "@/lib/api/axiosInstance";
import axios from "axios";

interface Props {
  reportId: string;
  onClose:  () => void;
  onSuccess?: () => void; // ✅ callback اختياري لتحديث الـ UI فوراً
}

export default function AppealModal({ reportId, onClose, onSuccess }: Props) {
  const [appealText, setAppealText] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState("");
  const [success,    setSuccess]    = useState(false);

  const handleSubmit = async () => {
    const trimmed = appealText.trim();
    if (!trimmed) { setErrorMsg("اكتب رسالة الاعتراض أولاً"); return; }
    if (trimmed.length < 10) { setErrorMsg("الاعتراض قصير جداً (10 أحرف على الأقل)"); return; }

    setErrorMsg("");
    setLoading(true);
    try {
      await axiosInstance.post(`/api/reports/${reportId}/appeal`, {
        appealText: trimmed,
      });
      setSuccess(true);
      onSuccess?.(); // ✅ أبلغ الـ parent بالنجاح فوراً
      setTimeout(onClose, 2000);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.msg ?? "حدث خطأ، حاول مرة أخرى"
        : "حدث خطأ، حاول مرة أخرى";

      // ✅ رسائل مخصصة حسب الكود
      const code = axios.isAxiosError(err) ? err.response?.data?.code : null;
      setErrorMsg(
        code === 'APPEAL_WINDOW_CLOSED' ? 'انتهت مهلة الاعتراض (72 ساعة)' :
        code === 'ALREADY_APPEALED'     ? 'قدّمت اعتراضاً مسبقاً على هذا البلاغ' :
        code === 'FORBIDDEN'            ? 'غير مصرح لك بالاعتراض' :
        msg
      );
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
            الاعتراض على البلاغ ⚖️
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="إغلاق"
          >
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
            <p className="text-xs text-gray-400 mb-1 font-medium">
              لديك حتى 72 ساعة من تاريخ البلاغ لتقديم اعتراضك
            </p>
            <p className="text-xs text-gray-500 mb-3 font-medium">
              اشرح سبب اعتراضك بوضوح *
            </p>

            <textarea
              value={appealText}
              onChange={(e) => {
                setAppealText(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              maxLength={1000}
              rows={5}
              placeholder="اكتب توضيحك هنا..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none mb-1 focus:outline-none focus:border-primary transition-colors"
            />

            <div className="flex justify-between items-center mb-4">
              {errorMsg ? (
                <p className="text-xs text-red-500 font-bold">{errorMsg}</p>
              ) : (
                <span />
              )}
              <p className="text-[10px] text-gray-400">
                {appealText.length}/1000
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !appealText.trim()}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl disabled:opacity-50 hover:bg-primary/90 active:scale-[.98] transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  جاري الإرسال...
                </span>
              ) : (
                "إرسال الاعتراض"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}