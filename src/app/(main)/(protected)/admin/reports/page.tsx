// src/app/(main)/(protected)/admin/reports/page.tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import useSWR, { mutate as globalMutate } from "swr";
import axiosInstance from "@/lib/api/axiosInstance";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import type { ReportStatus } from "@/types/report.types";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AdminReportFull {
  _id:          string;
  reporter:     { _id: string; name: string; avatar?: string };
  reportedUser: { _id: string; name: string; avatar?: string; isBanned?: boolean };
  relatedItem:  { _id: string; title: string } | null;
  reason:       string;
  details:      string;
  status:       ReportStatus;
  adminNote:    string;
  appealText:   string;
  appealedAt:   string | null;
  resolvedAt:   string | null;
  createdAt:    string;
  // ✅ FIX BUG-06: حقول isRepeatOffender موجودة في الـ API — أضفناها للـ Interface
  totalReportsAgainstUser:   number;
  pendingReportsAgainstUser: number;
  isRepeatOffender:          boolean;
}

interface AdminReportsResponse {
  reports:    AdminReportFull[];
  totalPages: number; // ✅ FIX BUG-07: "totalPages" يطابق الـ Backend المُصلَح
  total:      number;
}

interface ResolvePayload {
  status:    ReportStatus;
  adminNote: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending:   "قيد المراجعة",
  reviewed:  "تمّت المراجعة",
  dismissed: "تم الرفض",
  actioned:  "تم الإجراء",
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  reviewed:  "bg-blue-100 text-blue-800",
  dismissed: "bg-gray-100 text-gray-600",
  actioned:  "bg-green-100 text-green-800",
};

const getUserInitial = (name?: string | null): string =>
  name?.trim().charAt(0).toUpperCase() ?? "؟";

const getUserName = (name?: string | null): string =>
  name?.trim() || "مستخدم محذوف";

// ✅ FIX BUG-06: عدم إرسال status عند "all" → الـ Backend يُعيد كل الحالات
const SWR_KEY = (page: number, statusFilter: string) =>
  `/api/admin/reports?page=${page}&limit=10${
    statusFilter !== "all" ? `&status=${statusFilter}` : ""
  }`;

const fetcher = (url: string) =>
  axiosInstance.get<AdminReportsResponse>(url).then((r) => r.data);

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function AdminReportsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { show: showToast, ToastComponent } = useToast();

  const [page,         setPage]         = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [selected,     setSelected]     = useState<AdminReportFull | null>(null);
  const [adminNote,    setAdminNote]    = useState("");
  const [actionStatus, setActionStatus] = useState<ReportStatus>("actioned");
  const [submitting,   setSubmitting]   = useState(false);
  const [loadingId,    setLoadingId]    = useState<string | null>(null);

  const swrKey = SWR_KEY(page, statusFilter);

  const { data, error, isLoading } = useSWR<AdminReportsResponse>(
    swrKey,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const handleResolve = useCallback(async () => {
    if (!selected || submitting) return;

    const trimmedNote = adminNote.trim();
    if (!trimmedNote) {
      showToast("يجب كتابة ملاحظة المشرف قبل الإجراء", false);
      return;
    }

    setSubmitting(true);
    setLoadingId(selected._id);

    try {
      // ✅ FIX BUG-01: يُرسل "status" ← يطابق الـ Backend المُصلَح تماماً
      const payload: ResolvePayload = {
        status:    actionStatus,
        adminNote: trimmedNote,
      };

      await axiosInstance.patch(
        `/api/admin/reports/${selected._id}/resolve`,
        payload
      );

      await globalMutate(swrKey);
      showToast("تم تنفيذ الإجراء بنجاح ✅", true);
      setSelected(null);
      setAdminNote("");
    } catch (err) {
      showToast(extractErrorMsg(err, "فشل تنفيذ الإجراء"), false);
    } finally {
      setSubmitting(false);
      setLoadingId(null);
    }
  }, [selected, submitting, adminNote, actionStatus, swrKey, showToast]);

  const handleQuickDismiss = useCallback(
    async (reportId: string) => {
      if (loadingId) return;
      setLoadingId(reportId);
      try {
        await axiosInstance.patch(`/api/admin/reports/${reportId}/resolve`, {
          status:    "dismissed" satisfies ReportStatus,
          adminNote: "تم الرفض تلقائياً",
        });
        await globalMutate(swrKey);
        showToast("تم رفض البلاغ ✅", true);
      } catch (err) {
        showToast(extractErrorMsg(err, "فشل رفض البلاغ"), false);
      } finally {
        setLoadingId(null);
      }
    },
    [loadingId, swrKey, showToast]
  );

  // ─── Guards ─────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 text-sm animate-pulse">
          جارٍ التحقق من الصلاحيات...
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="text-4xl">🚫</span>
        <p className="text-red-600 font-semibold text-lg">
          غير مصرح — هذه الصفحة للمشرفين فقط
        </p>
      </div>
    );
  }

  // ─── Render ────────────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto" dir="rtl">
      {ToastComponent}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة البلاغات</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-1">
              إجمالي البلاغات: {data.total}
            </p>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ReportStatus | "all");
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">جميع الحالات</option>
          {(Object.keys(STATUS_LABELS) as ReportStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-4xl">⚠️</span>
          <p className="text-red-500 font-medium">
            {extractErrorMsg(error, "تعذّر تحميل البلاغات")}
          </p>
          <button
            onClick={() => globalMutate(swrKey)}
            className="text-sm text-blue-600 underline"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {!isLoading && !error && data?.reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
          <span className="text-6xl">🗂️</span>
          <p className="text-lg font-semibold text-gray-500">لا توجد بلاغات</p>
          <p className="text-sm">
            {statusFilter !== "all"
              ? `لا يوجد بلاغات بحالة "${STATUS_LABELS[statusFilter as ReportStatus]}"`
              : "لم يُرفع أي بلاغ حتى الآن"}
          </p>
        </div>
      )}

      {!isLoading && !error && data && data.reports.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 bg-white text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">المُبلِّغ</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">المُبلَّغ عنه</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">السبب</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">التاريخ</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.reports.map((report) => (
                  <tr
                    key={report._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      loadingId === report._id ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {/* المُبلِّغ */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {report.reporter?.avatar ? (
                          <Image
                            src={report.reporter.avatar}
                            alt={getUserName(report.reporter?.name)}
                            width={28} height={28}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                            {getUserInitial(report.reporter?.name)}
                          </div>
                        )}
                        <span className="font-medium text-gray-800">
                          {getUserName(report.reporter?.name)}
                        </span>
                      </div>
                    </td>

                    {/* المُبلَّغ عنه */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {report.reportedUser?.avatar ? (
                          <Image
                            src={report.reportedUser.avatar}
                            alt={getUserName(report.reportedUser?.name)}
                            width={28} height={28}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                            {getUserInitial(report.reportedUser?.name)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {getUserName(report.reportedUser?.name)}
                          </span>
                          {/* ✅ FIX BUG-06: عرض isRepeatOffender في الجدول */}
                          {report.isRepeatOffender && (
                            <span className="text-xs text-orange-600 font-semibold">
                              ⚠️ مخالف متكرر ({report.totalReportsAgainstUser} بلاغ)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* السبب */}
                    <td className="px-4 py-3 max-w-40">
                      <span className="truncate block text-gray-700">{report.reason}</span>
                      {report.relatedItem && (
                        <span className="text-xs text-gray-400 truncate block">
                          غرض: {report.relatedItem.title}
                        </span>
                      )}
                    </td>

                    {/* الحالة */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[report.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABELS[report.status] ?? report.status}
                      </span>
                    </td>

                    {/* التاريخ */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(report.createdAt).toLocaleDateString("ar-JO", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>

                    {/* الإجراءات */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {report.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setSelected(report);
                                setAdminNote(report.adminNote ?? "");
                                setActionStatus("actioned");
                              }}
                              disabled={!!loadingId}
                              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              مراجعة
                            </button>
                            <button
                              onClick={() => handleQuickDismiss(report._id)}
                              disabled={!!loadingId}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                            >
                              رفض سريع
                            </button>
                          </>
                        )}
                        {report.status !== "pending" && (
                          <button
                            onClick={() => {
                              setSelected(report);
                              setAdminNote(report.adminNote ?? "");
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            عرض التفاصيل
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← السابق
              </button>
              <span className="text-sm text-gray-600">
                صفحة {page} من {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                التالي →
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── Modal ──────────── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !submitting) setSelected(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">تفاصيل البلاغ</h2>
              <button
                onClick={() => !submitting && setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
                aria-label="إغلاق"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* ✅ FIX BUG-06: عرض إحصائيات المخالف في الـ Modal */}
              {selected.totalReportsAgainstUser > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selected.isRepeatOffender
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {selected.totalReportsAgainstUser} بلاغ إجمالي ضد هذا المستخدم
                  </span>
                  {selected.pendingReportsAgainstUser > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      {selected.pendingReportsAgainstUser} بلاغ قيد المراجعة
                    </span>
                  )}
                  {selected.isRepeatOffender && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                      ⚠️ مخالف متكرر
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">المُبلِّغ</p>
                  <p className="font-semibold text-gray-800 text-sm">{getUserName(selected.reporter?.name)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">المُبلَّغ عنه</p>
                  <p className="font-semibold text-red-700 text-sm">{getUserName(selected.reportedUser?.name)}</p>
                  {selected.reportedUser?.isBanned && (
                    <span className="text-xs text-red-500 font-medium">🚫 محظور</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">السبب</p>
                <p className="text-sm text-gray-800 bg-yellow-50 rounded-lg px-3 py-2">{selected.reason}</p>
              </div>

              {selected.details && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">تفاصيل إضافية</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-wrap break-words">
                    {selected.details}
                  </p>
                </div>
              )}

              {selected.appealText && (
                <div className="border-r-4 border-orange-400 pr-3 bg-orange-50 rounded-lg py-2">
                  <p className="text-xs font-semibold text-orange-600 mb-1">طعن المستخدم</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {selected.appealText}
                  </p>
                </div>
              )}

              {selected.relatedItem && (
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="font-medium">الغرض المرتبط: </span>
                  {selected.relatedItem.title}
                </div>
              )}

              {selected.status === "pending" && (
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <p className="text-sm font-semibold text-gray-700">اتخاذ إجراء</p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">نوع الإجراء</label>
                    <select
                      value={actionStatus}
                      onChange={(e) => setActionStatus(e.target.value as ReportStatus)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="actioned">{STATUS_LABELS.actioned}</option>
                      <option value="reviewed">{STATUS_LABELS.reviewed}</option>
                      <option value="dismissed">{STATUS_LABELS.dismissed}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      ملاحظة المشرف <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="اكتب ملاحظتك هنا..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 text-left mt-0.5">{adminNote.length}/500</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleResolve}
                      disabled={submitting || !adminNote.trim()}
                      className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          جارٍ التنفيذ...
                        </span>
                      ) : "تأكيد الإجراء"}
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      disabled={submitting}
                      className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {selected.status !== "pending" && selected.adminNote && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">ملاحظة المشرف</p>
                  <p className="text-sm text-gray-700 bg-blue-50 rounded-lg px-3 py-2 whitespace-pre-wrap break-words">
                    {selected.adminNote}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}