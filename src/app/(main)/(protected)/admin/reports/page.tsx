// src/app/(main)/(protected)/admin/reports/page.tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import useSWR from "swr";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { getAdminReports, resolveAdminReport } from "@/lib/api/reportApi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import type {
  AdminReportsResponse,
  ModerationReport,
  ReportDecision,
  ReportStatus,
  ResolveReportPayload,
} from "@/types/report.types";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "قيد المراجعة",
  reviewed: "تمّت المراجعة",
  dismissed: "تم الرفض",
  actioned: "تم الإجراء",
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  reviewed: "bg-blue-50 text-blue-700 border border-blue-200",
  dismissed: "bg-slate-100 text-slate-600 border border-slate-200",
  actioned: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const getUserInitial = (name?: string | null): string =>
  name?.trim().charAt(0).toUpperCase() ?? "؟";

const getUserName = (name?: string | null): string =>
  name?.trim() || "مستخدم محذوف";

const SWR_KEY = (page: number, statusFilter: string) =>
  ["admin-reports", page, statusFilter] as const;

const fetcher = ([, page, statusFilter]: ReturnType<typeof SWR_KEY>) =>
  getAdminReports({
    page,
    status: statusFilter as ReportStatus | "all",
  });

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function AdminReportsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { show: showToast, ToastComponent } = useToast();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [selected, setSelected] = useState<ModerationReport | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionStatus, setActionStatus] = useState<ReportDecision>("actioned");
  const [submitting, setSubmitting] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const swrKey = !authLoading && isAdmin ? SWR_KEY(page, statusFilter) : null;

  const { data, error, isLoading, mutate } = useSWR<AdminReportsResponse>(
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
      const payload: ResolveReportPayload = {
        status: actionStatus,
        adminNote: trimmedNote,
      };

      await resolveAdminReport(selected._id, payload);

      await mutate();
      showToast("تم تنفيذ الإجراء بنجاح ✅", true);
      setSelected(null);
      setAdminNote("");
    } catch (err) {
      showToast(extractErrorMsg(err, "فشل تنفيذ الإجراء"), false);
    } finally {
      setSubmitting(false);
      setLoadingId(null);
    }
  }, [selected, submitting, adminNote, actionStatus, mutate, showToast]);

  const handleQuickDismiss = useCallback(
    async (reportId: string) => {
      if (loadingId) return;
      setLoadingId(reportId);
      try {
        await resolveAdminReport(reportId, {
          status: "dismissed",
          adminNote: "تم رفض البلاغ بعد المراجعة",
        });
        await mutate();
        showToast("تم رفض البلاغ ✅", true);
      } catch (err) {
        showToast(extractErrorMsg(err, "فشل رفض البلاغ"), false);
      } finally {
        setLoadingId(null);
      }
    },
    [loadingId, mutate, showToast]
  );

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" dir="rtl">
        <div className="rounded-2xl border border-[#ece6de] bg-white px-6 py-4 text-sm font-bold text-[#7c766f] shadow-sm">
          جارٍ التحقق من الصلاحيات...
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" dir="rtl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <span className="material-symbols-outlined text-[30px]">gpp_bad</span>
        </div>
        <p className="text-lg font-black text-red-600">
          غير مصرح — هذه الصفحة للمشرفين فقط
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8" dir="rtl">
      {ToastComponent}

      {/* Header */}
      <section className="rounded-[30px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-extrabold text-primary">
              <span className="material-symbols-outlined text-[15px]">flag</span>
              لوحة إدارة البلاغات
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#1f312f]">
              إدارة البلاغات
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7a746d]">
              مراجعة البلاغات، تتبع المخالفين المتكررين، واتخاذ قرارات واضحة من
              واجهة إشراف احترافية ومريحة بصريًا.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl border border-[#ece6de] bg-white px-4 py-2 text-xs font-bold text-[#5f5a54] shadow-sm">
              إجمالي البلاغات:{" "}
              <span className="font-black text-[#1f312f]">
                {data?.total ?? "—"}
              </span>
            </div>

            <div className="rounded-2xl border border-[#ece6de] bg-white px-4 py-2 text-xs font-bold text-[#5f5a54] shadow-sm">
              الصفحة:{" "}
              <span className="font-black text-[#1f312f]">
                {page}
                {data?.totalPages ? ` / ${data.totalPages}` : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="rounded-[24px] border border-[#e8e2d9] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black text-[#233433]">فلترة الحالة</h2>
            <p className="mt-1 text-xs text-[#8a837a]">
              اعرض جميع البلاغات أو ركّز على حالة محددة فقط
            </p>
          </div>

          <div className="relative w-full sm:w-[240px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ReportStatus | "all");
                setPage(1);
              }}
              className="w-full appearance-none rounded-2xl border border-[#e4ddd4] bg-[#fcfaf7] px-4 py-3 text-sm font-bold text-[#233433] outline-none transition-all duration-300 focus:border-primary"
            >
              <option value="all">جميع الحالات</option>
              {(Object.keys(STATUS_LABELS) as ReportStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9c948b]">
              expand_more
            </span>
          </div>
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-[#eee8df] bg-white"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-[#f0d8d8] bg-white py-20 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <span className="material-symbols-outlined text-[28px]">error</span>
          </div>

          <div>
            <p className="text-base font-black text-red-600">
              {extractErrorMsg(error, "تعذّر تحميل البلاغات")}
            </p>
            <p className="mt-1 text-sm text-[#8f877f]">
              حدثت مشكلة أثناء جلب البيانات من الخادم
            </p>
          </div>

          <button
            onClick={() => void mutate()}
            className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-black text-white transition-all duration-300 hover:opacity-90"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && data?.reports.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-[#e8e2d9] bg-white py-24 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f4f1eb] text-[#a89f95]">
            <span className="material-symbols-outlined text-[30px]">folder_open</span>
          </div>

          <div>
            <p className="text-lg font-black text-[#5d5750]">لا توجد بلاغات</p>
            <p className="mt-1 text-sm text-[#9f978e]">
              {statusFilter !== "all"
                ? `لا يوجد بلاغات بحالة "${STATUS_LABELS[statusFilter as ReportStatus]}"`
                : "لم يُرفع أي بلاغ حتى الآن"}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && data && data.reports.length > 0 && (
        <>
          <section className="overflow-hidden rounded-[28px] border border-[#e8e2d9] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between border-b border-[#f0ebe4] bg-[#faf8f4] px-5 py-4">
              <div>
                <h2 className="text-sm font-black text-[#233433]">قائمة البلاغات</h2>
                <p className="mt-1 text-xs text-[#8a837a]">
                  متابعة الحالات المعلقة والمنتهية من نفس الصفحة
                </p>
              </div>

              <div className="rounded-full border border-[#e9e3db] bg-white px-3 py-1 text-[11px] font-extrabold text-[#8e877f]">
                {data.total} بلاغ
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full bg-white text-sm">
                <thead className="bg-white">
                  <tr className="border-b border-[#f0ebe4] text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a39b92]">
                    <th className="px-4 py-4 text-right">المُبلِّغ</th>
                    <th className="px-4 py-4 text-right">المُبلَّغ عنه</th>
                    <th className="px-4 py-4 text-right">السبب</th>
                    <th className="px-4 py-4 text-right">الحالة</th>
                    <th className="px-4 py-4 text-right">التاريخ</th>
                    <th className="px-4 py-4 text-right">الإجراء</th>
                  </tr>
                </thead>

                <tbody>
                  {data.reports.map((report) => (
                    <tr
                      key={report._id}
                      className={`border-b border-[#f5f1eb] transition-colors hover:bg-[#fcfaf7] ${
                        loadingId === report._id ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {/* Reporter */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {report.reporter?.avatar ? (
                            <Image
                              src={report.reporter.avatar}
                              alt={getUserName(report.reporter?.name)}
                              width={36}
                              height={36}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-600">
                              {getUserInitial(report.reporter?.name)}
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-bold text-[#223433]">
                              {getUserName(report.reporter?.name)}
                            </p>
                            <p className="text-xs text-[#9b948c]">صاحب البلاغ</p>
                          </div>
                        </div>
                      </td>

                      {/* Reported User */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {report.reportedUser?.avatar ? (
                            <Image
                              src={report.reportedUser.avatar}
                              alt={getUserName(report.reportedUser?.name)}
                              width={36}
                              height={36}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-black text-red-600">
                              {getUserInitial(report.reportedUser?.name)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#223433]">
                              {getUserName(report.reportedUser?.name)}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {report.reportedUser?.isBanned && (
                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-black text-red-600">
                                  محظور
                                </span>
                              )}

                              {report.isRepeatOffender && (
                                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-black text-orange-600">
                                  مخالف متكرر ({report.actionedReportsAgainstUser})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="max-w-[280px] px-4 py-4">
                        <p className="line-clamp-1 text-sm font-medium text-[#3a3834]">
                          {report.reason}
                        </p>
                        {report.relatedItem && (
                          <p className="mt-1 line-clamp-1 text-xs text-[#9b948c]">
                            غرض مرتبط: {report.relatedItem.title}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${
                            STATUS_COLORS[report.status] ?? "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {STATUS_LABELS[report.status] ?? report.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-[#8f877f]">
                          {new Date(report.createdAt).toLocaleDateString("ar-JO", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
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
                                className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white transition-all duration-300 hover:bg-blue-700 disabled:opacity-50"
                              >
                                مراجعة
                              </button>

                              <button
                                onClick={() => handleQuickDismiss(report._id)}
                                disabled={!!loadingId}
                                className="rounded-xl bg-[#f3f0ea] px-3 py-2 text-xs font-black text-[#5e5a55] transition-all duration-300 hover:bg-[#ebe5dd] disabled:opacity-50"
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
                              className="rounded-xl border border-[#e2ddd5] bg-white px-3 py-2 text-xs font-black text-[#64605b] transition-all duration-300 hover:bg-[#faf8f4]"
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
          </section>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-2xl border border-[#e5dfd6] bg-white px-4 py-2 text-sm font-bold text-[#6d6760] transition-all hover:bg-[#faf8f4] disabled:cursor-not-allowed disabled:opacity-40"
              >
                السابق
              </button>

              <span className="text-sm font-bold text-[#6f6962]">
                صفحة {page} من {data.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="rounded-2xl border border-[#e5dfd6] bg-white px-4 py-2 text-sm font-bold text-[#6d6760] transition-all hover:bg-[#faf8f4] disabled:cursor-not-allowed disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setSelected(null);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/20 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f0ebe4] px-6 py-5">
              <div>
                <h2 className="text-lg font-black text-[#1f312f]">تفاصيل البلاغ</h2>
                <p className="mt-1 text-xs text-[#938b82]">
                  مراجعة الحالة والبت فيها من نفس النافذة
                </p>
              </div>

              <button
                onClick={() => !submitting && setSelected(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f1eb] text-[#6e6860] transition-colors hover:bg-[#ece6de]"
                aria-label="إغلاق"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              {/* Offender Stats */}
              {selected.totalReportsAgainstUser > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      selected.isRepeatOffender
                        ? "bg-red-50 text-red-700"
                        : "bg-[#f3f0ea] text-[#6a655f]"
                    }`}
                  >
                    {selected.totalReportsAgainstUser} بلاغ إجمالي ضد هذا المستخدم
                  </span>

                  {selected.pendingReportsAgainstUser > 0 && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      {selected.pendingReportsAgainstUser} بلاغ قيد المراجعة
                    </span>
                  )}

                  {selected.actionedReportsAgainstUser > 0 && (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                      {selected.actionedReportsAgainstUser} بلاغ معتمد
                    </span>
                  )}

                  {selected.isRepeatOffender && (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                      مخالف متكرر
                    </span>
                  )}
                </div>
              )}

              {/* User cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#ebe4db] bg-[#faf8f4] p-4">
                  <p className="mb-1 text-xs font-bold text-[#9b948c]">المُبلِّغ</p>
                  <p className="text-sm font-black text-[#223433]">
                    {getUserName(selected.reporter?.name)}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                  <p className="mb-1 text-xs font-bold text-[#b88a8a]">المُبلَّغ عنه</p>
                  <p className="text-sm font-black text-red-700">
                    {getUserName(selected.reportedUser?.name)}
                  </p>
                  {selected.reportedUser?.isBanned && (
                    <span className="mt-1 inline-block text-xs font-bold text-red-500">
                      محظور حالياً
                    </span>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="mb-2 text-xs font-extrabold text-[#8f877f]">السبب</p>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-[#5b5147]">
                  {selected.reason}
                </div>
              </div>

              {/* Details */}
              {selected.details && (
                <div>
                  <p className="mb-2 text-xs font-extrabold text-[#8f877f]">
                    تفاصيل إضافية
                  </p>
                  <div className="whitespace-pre-wrap break-words rounded-2xl border border-[#ebe4db] bg-[#faf8f4] px-4 py-3 text-sm leading-7 text-[#5e5953]">
                    {selected.details}
                  </div>
                </div>
              )}

              {/* Appeal */}
              {selected.appealText && (
                <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
                  <p className="mb-1 text-xs font-extrabold text-orange-700">
                    طعن المستخدم
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#5f5952]">
                    {selected.appealText}
                  </p>
                </div>
              )}

              {/* Related Item */}
              {selected.relatedItem && (
                <div className="rounded-2xl border border-[#ebe4db] bg-white px-4 py-3 text-sm text-[#5f5a54]">
                  <span className="font-black text-[#223433]">الغرض المرتبط: </span>
                  {selected.relatedItem.title}
                </div>
              )}

              {/* Action Section */}
              {selected.status === "pending" && (
                <div className="space-y-4 border-t border-[#f0ebe4] pt-5">
                  <p className="text-sm font-black text-[#223433]">اتخاذ إجراء</p>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-[#8c857d]">
                      نوع الإجراء
                    </label>
                    <select
                      value={actionStatus}
                      onChange={(e) => setActionStatus(e.target.value as ReportDecision)}
                      className="w-full rounded-2xl border border-[#e4ddd4] bg-[#fcfaf7] px-4 py-3 text-sm font-bold text-[#233433] outline-none transition-all duration-300 focus:border-primary"
                    >
                      <option value="actioned">{STATUS_LABELS.actioned}</option>
                      <option value="reviewed">{STATUS_LABELS.reviewed}</option>
                      <option value="dismissed">{STATUS_LABELS.dismissed}</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-[#8c857d]">
                      ملاحظة المشرف <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      rows={4}
                      maxLength={500}
                      placeholder="اكتب ملاحظتك هنا..."
                      className="w-full resize-none rounded-2xl border border-[#e4ddd4] bg-[#fcfaf7] px-4 py-3 text-sm text-[#24302f] outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary"
                    />
                    <p className="mt-1 text-left text-xs text-[#aaa29a]">
                      {adminNote.length}/500
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleResolve}
                      disabled={submitting || !adminNote.trim()}
                      className="flex-1 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          جارٍ التنفيذ...
                        </span>
                      ) : (
                        "تأكيد الإجراء"
                      )}
                    </button>

                    <button
                      onClick={() => setSelected(null)}
                      disabled={submitting}
                      className="rounded-2xl border border-[#e2ddd5] px-5 py-3 text-sm font-bold text-[#66615b] transition-all duration-300 hover:bg-[#faf8f4] disabled:opacity-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Existing admin note */}
              {selected.status !== "pending" && selected.adminNote && (
                <div className="border-t border-[#f0ebe4] pt-4">
                  <p className="mb-2 text-xs font-extrabold text-[#8f877f]">
                    ملاحظة المشرف
                  </p>
                  <div className="whitespace-pre-wrap break-words rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-7 text-[#505d6c]">
                    {selected.adminNote}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
