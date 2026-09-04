"use client";

import PaginationControls from "@/components/ui/PaginationControls";
import AdminLogsTable from "./components/AdminLogsTable";
import { useAdminLogs } from "./hooks/useAdminLogs";

export default function AdminLogsPage() {
  const { loading, logs, page, pages, setPage, stats } = useAdminLogs();

  return (
    <div
      dir="rtl"
      className="space-y-6 text-[#211d18]"
      style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
    >
      {/* Header */}
      <section className="admin-page-hero relative overflow-hidden rounded-[32px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-7">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-[#005a8c]/[0.05] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-extrabold text-primary">
              <span className="material-symbols-outlined text-[15px]">history</span>
              Audit Trail Workspace
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#1f312f] md:text-[2rem]">
              سجل العمليات
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7a746d]">
              مراجعة جميع التدخلات الإدارية بشكل زمني واضح، مع إبراز نوع الإجراء،
              المستهدف، السبب، وتعليق المشرف في واجهة أسهل للمسح السريع.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            {[
              { icon: "shield_person", label: "أثر كل إجراء" },
              { icon: "gavel", label: "مراجعة البلاغات" },
              { icon: "schedule", label: "تسلسل زمني" },
            ].map((item, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#ece6de] bg-white px-3.5 py-2 text-xs font-bold text-[#5f5a54] shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {item.icon}
                </span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento summary */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:col-span-5">
          <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-primary/5 blur-3xl" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[24px]">
                policy
              </span>
            </div>

            <span className="rounded-full border border-[#ece6de] bg-[#faf8f4] px-3 py-1 text-[10px] font-extrabold tracking-[0.18em] text-[#9a9289]">
              AUDIT
            </span>
          </div>

          <div className="mt-10">
            <p className="text-5xl font-black leading-none tracking-tight text-[#1f312f]">
              {stats.total}
            </p>
            <p className="mt-3 text-sm font-bold text-[#7b756e]">
              عدد السجلات في الصفحة الحالية
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              صفحة {page} من {pages}
            </span>
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              نشاطات إدارية موثقة
            </span>
          </div>
        </div>

        {[
          {
            label: "بلاغات",
            value: stats.reportActions,
            icon: "flag",
            wrap: "bg-yellow-50 text-yellow-700",
            span: "lg:col-span-2",
          },
          {
            label: "حظر",
            value: stats.bans,
            icon: "block",
            wrap: "bg-red-50 text-red-600",
            span: "lg:col-span-2",
          },
          {
            label: "ترقيات",
            value: stats.promotions,
            icon: "arrow_upward",
            wrap: "bg-blue-50 text-blue-600",
            span: "lg:col-span-1",
          },
          {
            label: "ملاحظات",
            value: stats.notes,
            icon: "sticky_note_2",
            wrap: "bg-indigo-50 text-indigo-600",
            span: "lg:col-span-2",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-[28px] border border-[#e8e2d9] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] ${card.span}`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.wrap}`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {card.icon}
              </span>
            </div>

            <div className="mt-7">
              <p className="text-3xl font-black leading-none tracking-tight text-[#1f312f]">
                {card.value}
              </p>
              <p className="mt-2 text-sm font-bold text-[#7a746d]">{card.label}</p>
            </div>
          </div>
        ))}
      </section>

      <AdminLogsTable logs={logs} loading={loading} />

      {/* Pagination */}
      <PaginationControls
        page={page}
        totalPages={pages}
        onPageChange={setPage}
      />
    </div>
  );
}
