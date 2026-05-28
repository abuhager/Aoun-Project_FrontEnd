"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import axiosInstance from "@/lib/api/axiosInstance";

interface Report {
  _id:          string;
  reporter:     { name: string };
  reportedUser: { name: string };
  relatedItem?: { title: string };
  reason:       string;
  details?:     string;
  status:       string;
  createdAt:    string;
  appealText?:  string;   // ✅ جديد
  appealedAt?:  string;   // ✅ جديد
}

export default function AdminReportsPage() {
  const [reports,  setReports]  = useState<Report[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get("/api/admin/reports");
      setReports(r.data.reports);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  const resolve = async (id: string, action: string) => {
  try {
    await axiosInstance.post(`/api/admin/reports/${id}/resolve`, { action });
    showToast(
      action === "warn"    ? "✅ تم إرسال التحذير للمستخدم"  :
      action === "ban"     ? "🚫 تم حظر المستخدم"            :
                             "✅ تم رفض البلاغ",
      true
    );
    // ✅ احذف البلاغ من الـ state فوراً (Optimistic) + ريفرش
    setReports((prev) => prev.filter((r) => r._id !== id));
    await loadReports();
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.msg ?? "حدث خطأ"
      : "حدث خطأ";
    showToast(msg, false);
  }
};

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white transition-all ${
          toast.ok ? "bg-green-500" : "bg-red-500"
        }`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-xl font-black flex items-center gap-2">
        <span className="material-symbols-outlined text-orange-500">flag</span>
        البلاغات المعلّقة
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">check_circle</span>
          <p className="text-gray-400 font-bold text-sm">لا توجد بلاغات معلّقة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">

                {/* معلومات البلاغ */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-gray-800">
                      {r.reporter?.name}
                    </span>
                    <span className="material-symbols-outlined text-sm text-gray-400">arrow_back</span>
                    <span className="text-xs font-black text-red-600">
                      {r.reportedUser?.name}
                    </span>
                    {r.relatedItem && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                        {r.relatedItem.title}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-600 font-bold">
                    السبب: <span className="text-gray-800">{r.reason}</span>
                  </p>

                  {r.details && (
                    <p className="text-[10px] text-gray-400">{r.details}</p>
                  )}

                  {/* ✅ عرض الاعتراض إذا موجود */}
                  {r.appealText ? (
  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
    ⚖️ طعن المستخدم
  </span>
) : (
  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
    ✅ انتهت مهلة الطعن
  </span>
)}

                  <p className="text-[10px] text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>

                {/* الأزرار */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => resolve(r._id, "warn")}
                    className="px-4 py-2 rounded-xl text-[11px] font-black bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">warning</span>
                    تحذير
                  </button>
                  <button
                    onClick={() => resolve(r._id, "ban")}
                    className="px-4 py-2 rounded-xl text-[11px] font-black bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">block</span>
                    حظر
                  </button>
                  <button
                    onClick={() => resolve(r._id, "dismiss")}
                    className="px-4 py-2 rounded-xl text-[11px] font-black bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                    رفض
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}