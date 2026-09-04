import Image from "next/image";
import PaginationControls from "@/components/ui/PaginationControls";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import type {
  AdminReportsResponse,
  ModerationReport,
  ReportStatus,
} from "@/types/report.types";
import {
  getReportUserInitial,
  getReportUserName,
  REPORT_STATUS_COLORS,
  REPORT_STATUS_LABELS,
} from "../reportPresentation";

type AdminReportsContentProps = {
  data?: AdminReportsResponse;
  error: unknown;
  isLoading: boolean;
  loadingId: string | null;
  page: number;
  statusFilter: ReportStatus | "all";
  retry: () => unknown;
  openReport: (report: ModerationReport) => void;
  dismissReport: (reportId: string) => void | Promise<void>;
  setPage: (page: number) => void;
};

export default function AdminReportsContent({
  data,
  error,
  isLoading,
  loadingId,
  page,
  statusFilter,
  retry,
  openReport,
  dismissReport,
  setPage,
}: AdminReportsContentProps) {
  return (
    <>
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
          onClick={() => void retry()}
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
              ? `لا يوجد بلاغات بحالة "${REPORT_STATUS_LABELS[statusFilter as ReportStatus]}"`
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

          <ResponsiveTable label="جدول بلاغات المنصة">
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
                            alt={getReportUserName(report.reporter?.name)}
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-600">
                            {getReportUserInitial(report.reporter?.name)}
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-bold text-[#223433]">
                            {getReportUserName(report.reporter?.name)}
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
                            alt={getReportUserName(report.reportedUser?.name)}
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-black text-red-600">
                            {getReportUserInitial(report.reportedUser?.name)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#223433]">
                            {getReportUserName(report.reportedUser?.name)}
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
                          REPORT_STATUS_COLORS[report.status] ?? "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {REPORT_STATUS_LABELS[report.status] ?? report.status}
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
                              onClick={() => openReport(report)}
                              disabled={!!loadingId}
                              className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white transition-all duration-300 hover:bg-blue-700 disabled:opacity-50"
                            >
                              مراجعة
                            </button>

                            <button
                              onClick={() => dismissReport(report._id)}
                              disabled={!!loadingId}
                              className="rounded-xl bg-[#f3f0ea] px-3 py-2 text-xs font-black text-[#5e5a55] transition-all duration-300 hover:bg-[#ebe5dd] disabled:opacity-50"
                            >
                              رفض سريع
                            </button>
                          </>
                        )}

                        {report.status !== "pending" && (
                          <button
                            onClick={() => openReport(report)}
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
          </ResponsiveTable>
        </section>

        {/* Pagination */}
        <PaginationControls
          page={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
          mode="compact"
        />
      </>
    )}
    </>
  );
}
