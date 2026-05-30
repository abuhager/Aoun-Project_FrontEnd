// src/app/(main)/(protected)/admin/reports/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import axiosInstance from "@/lib/api/axiosInstance";
import Link from "next/link";

interface Report {
  _id:        string;
  reporter?:  { _id?: string; name?: string; email?: string; phone?: string };
  reportedUser?: {
    _id?:     string;
    name?:    string;
    email?:   string;
    phone?:   string;
    isBanned?: boolean;
  };
  relatedItem?: { title?: string };
  reason:     string;
  details?:   string;
  status:     string;
  createdAt:  string;
  appealText?: string;
  appealedAt?: string;
  totalReportsAgainstUser?: number;
}

interface PaginationMeta {
  total: number;
  page:  number;
  pages: number;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [meta,    setMeta]    = useState<PaginationMeta>({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null);
  const [notes,   setNotes]   = useState<Record<string, string>>({});
  const [busy,    setBusy]    = useState<Record<string, boolean>>({});

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const loadReports = useCallback(async (page = 1, withLoader = true) => {
    if (withLoader) setLoading(true);
    try {
      const r = await axiosInstance.get("/api/admin/reports", { params: { page } });
      setReports(Array.isArray(r.data?.reports) ? r.data.reports : []);
      setMeta({
        total: r.data?.total ?? 0,
        page:  r.data?.page  ?? 1,
        pages: r.data?.pages ?? 1,
      });
    } catch {
      if (withLoader) {
        setReports([]);
        showToast("تعذر تحميل البلاغات", false);
      }
    } finally {
      if (withLoader) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadReports(1, true);
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, [loadReports]);

  const resolve = async (id: string, action: "warn" | "ban" | "dismiss") => {
    const adminNote = notes[id]?.trim();
    if (!adminNote) { showToast("تعليق الأدمن إجباري قبل تنفيذ الإجراء", false); return; }
    if (busy[id]) return;
    setBusy(p => ({ ...p, [id]: true }));
    try {
      await axiosInstance.post(`/api/admin/reports/${id}/resolve`, { action, adminNote });
      showToast(
        action === "warn" ? "✅ تم إرسال التحذير" :
        action === "ban"  ? "🚫 تم حظر المستخدم"  : "✅ تم رفض البلاغ",
        true
      );
      setNotes(p => { const n = { ...p }; delete n[id]; return n; });
      await loadReports(meta.page, false);
    } catch (err: unknown) {
      showToast(
        axios.isAxiosError(err) ? err.response?.data?.msg ?? "حدث خطأ" : "حدث خطأ",
        false
      );
    } finally {
      setBusy(p => ({ ...p, [id]: false }));
    }
  };

  return (
    <div className="space-y-6" dir="rtl">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3
          rounded-2xl shadow-lg text-sm font-bold text-white transition-all
          ${toast.ok ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-500">flag</span>
          البلاغات المعلّقة
          {meta.total > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full">
              {meta.total}
            </span>
          )}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">check_circle</span>
          <p className="text-gray-400 font-bold text-sm">لا توجد بلاغات معلّقة 🎉</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reports.map((report) => {
              const isBusy     = !!busy[report._id];
              const totalCount = report.totalReportsAgainstUser ?? 0;
              const countColor =
                totalCount >= 5 ? "bg-red-500 text-white" :
                totalCount >= 3 ? "bg-orange-400 text-white" :
                                  "bg-gray-100 text-gray-600";

              return (
                <div key={report._id}
                  className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 transition-all
                    ${report.reportedUser?.isBanned ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">

                      {/* ── رأس البلاغ ── */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-gray-500">المُبلِّغ:</span>

                        {/* اسم المُبلِّغ — رابط للبروفايل */}
                        {report.reporter?._id ? (
                          <Link href={`/profile/${report.reporter._id}`}
                            className="text-xs font-black text-primary hover:underline">
                            {report.reporter.name ?? "—"}
                          </Link>
                        ) : (
                          <span className="text-xs font-black text-gray-800">
                            {report.reporter?.name ?? "—"}
                          </span>
                        )}

                        <span className="material-symbols-outlined text-sm text-gray-300">arrow_back</span>

                        {/* اسم المُبلَّغ عنه — رابط للبروفايل */}
                        {report.reportedUser?._id ? (
                          <Link href={`/profile/${report.reportedUser._id}`}
                            className="text-xs font-black text-red-600 hover:underline">
                            {report.reportedUser.name ?? "—"}
                          </Link>
                        ) : (
                          <span className="text-xs font-black text-red-600">
                            {report.reportedUser?.name ?? "—"}
                          </span>
                        )}

                        {/* عداد البلاغات التراكمي */}
                        <span className={`flex items-center gap-0.5 text-[10px] font-black
                          px-2 py-0.5 rounded-full ${countColor}`}
                          title={`إجمالي البلاغات على ${report.reportedUser?.name}`}
                        >
                          <span className="material-symbols-outlined text-[11px]">flag</span>
                          {totalCount} بلاغ إجمالي
                        </span>

                        {/* badge محظور */}
                        {report.reportedUser?.isBanned && (
                          <span className="text-[10px] bg-red-100 text-red-600 font-black
                            px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">block</span>
                            محظور
                          </span>
                        )}

                        {report.relatedItem?.title && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                            {report.relatedItem.title}
                          </span>
                        )}
                      </div>

                      {/* ── معلومات المستخدمين ── */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-gray-500">
                        {/* المُبلِّغ */}
                        <div className="bg-gray-50 rounded-lg px-2 py-1.5 space-y-0.5">
                          <p className="font-black text-gray-400">المُبلِّغ</p>
                          {report.reporter?.email && (
                            <p className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">mail</span>
                              {report.reporter.email}
                            </p>
                          )}
                          {report.reporter?.phone && (
                            <p className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">phone</span>
                              {report.reporter.phone}
                            </p>
                          )}
                        </div>

                        {/* المُبلَّغ عنه */}
                        <div className="bg-red-50/60 rounded-lg px-2 py-1.5 space-y-0.5">
                          <p className="font-black text-red-400">المُبلَّغ عنه</p>
                          {report.reportedUser?.email && (
                            <p className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">mail</span>
                              {report.reportedUser.email}
                            </p>
                          )}
                          {report.reportedUser?.phone && (
                            <p className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">phone</span>
                              {report.reportedUser.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* السبب + التفاصيل */}
                      <p className="text-[11px] text-gray-600 font-bold">
                        السبب: <span className="text-gray-800">{report.reason}</span>
                      </p>
                      {report.details && (
                        <p className="text-[10px] text-gray-400 bg-gray-50 rounded-lg px-2 py-1">
                          {report.details}
                        </p>
                      )}

                      {/* طعن المستخدم */}
                      {report.appealText ? (
                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 space-y-1">
                          <span className="text-[10px] font-black text-yellow-700 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">gavel</span>
                            اعتراض المستخدم
                          </span>
                          <p className="text-[11px] text-yellow-800">{report.appealText}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                          ✅ انتهت مهلة الاعتراض
                        </span>
                      )}

                      <p className="text-[10px] text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>

                    {/* أزرار الإجراء */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => resolve(report._id, "warn")} disabled={isBusy}
                        className="px-4 py-2 rounded-xl text-[11px] font-black bg-yellow-50 text-yellow-700
                          hover:bg-yellow-100 disabled:opacity-50 transition-all flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        {isBusy ? "جاري..." : "تحذير"}
                      </button>
                      <button onClick={() => resolve(report._id, "ban")} disabled={isBusy}
                        className="px-4 py-2 rounded-xl text-[11px] font-black bg-red-50 text-red-600
                          hover:bg-red-100 disabled:opacity-50 transition-all flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">block</span>
                        {isBusy ? "جاري..." : "حظر"}
                      </button>
                      <button onClick={() => resolve(report._id, "dismiss")} disabled={isBusy}
                        className="px-4 py-2 rounded-xl text-[11px] font-black bg-gray-50 text-gray-500
                          hover:bg-gray-100 disabled:opacity-50 transition-all flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">close</span>
                        {isBusy ? "جاري..." : "رفض"}
                      </button>
                    </div>
                  </div>

                  {/* تعليق الأدمن */}
                  <div className="flex gap-2 pt-1 border-t border-gray-50">
                    <input
                      type="text"
                      value={notes[report._id] ?? ""}
                      onChange={e => setNotes(p => ({ ...p, [report._id]: e.target.value }))}
                      disabled={isBusy}
                      placeholder="تعليق الأدمن (إجباري)..."
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-[12px]
                        focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <span className="material-symbols-outlined text-gray-300 self-center text-sm">
                      sticky_note_2
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => loadReports(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gray-100 text-gray-600
                  hover:bg-gray-200 disabled:opacity-40 transition-all"
              >
                السابق
              </button>
              <span className="text-xs text-gray-500 font-bold">
                {meta.page} / {meta.pages}
              </span>
              <button
                onClick={() => loadReports(meta.page + 1)}
                disabled={meta.page >= meta.pages}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gray-100 text-gray-600
                  hover:bg-gray-200 disabled:opacity-40 transition-all"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}