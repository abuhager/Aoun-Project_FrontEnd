// src/app/(main)/(protected)/admin/reports/page.tsx
"use client";

import type { ReportStatus } from "@/types/report.types";
import AdminReportsContent from "./components/AdminReportsContent";
import ReportReviewDialog from "./components/ReportReviewDialog";
import { useAdminReports } from "./hooks/useAdminReports";
import { REPORT_STATUS_LABELS } from "./reportPresentation";

export default function AdminReportsClient() {
  const {
    actionStatus,
    adminNote,
    authLoading,
    closeReport,
    data,
    dismissReport,
    error,
    isAdmin,
    isLoading,
    loadingId,
    openReport,
    page,
    retry,
    resolveSelected,
    selected,
    setActionStatus,
    setAdminNote,
    setPage,
    setStatusFilter,
    statusFilter,
    submitting,
    ToastComponent,
    user,
  } = useAdminReports();

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
      <section className="admin-page-hero rounded-[30px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
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
              onChange={(event) =>
                setStatusFilter(event.target.value as ReportStatus | "all")
              }
              className="w-full appearance-none rounded-2xl border border-[#e4ddd4] bg-[#fcfaf7] px-4 py-3 text-sm font-bold text-[#233433] outline-none transition-all duration-300 focus:border-primary"
            >
              <option value="all">جميع الحالات</option>
              {(Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]).map((s) => (
                <option key={s} value={s}>
                  {REPORT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9c948b]">
              expand_more
            </span>
          </div>
        </div>
      </section>

      <AdminReportsContent
        data={data}
        error={error}
        isLoading={isLoading}
        loadingId={loadingId}
        page={page}
        statusFilter={statusFilter}
        retry={retry}
        openReport={openReport}
        dismissReport={dismissReport}
        setPage={setPage}
      />

      <ReportReviewDialog
        report={selected}
        adminNote={adminNote}
        actionStatus={actionStatus}
        submitting={submitting}
        onAdminNoteChange={setAdminNote}
        onActionStatusChange={setActionStatus}
        onResolve={resolveSelected}
        onClose={closeReport}
      />
    </div>
  );
}
