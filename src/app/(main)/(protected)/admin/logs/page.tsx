"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/api/axiosInstance";

interface PopulatedTarget {
  _id: string;
  name?: string;
  email?: string;
  title?: string;
}

interface Log {
  _id: string;
  adminId: { _id: string; name: string };
  action: string;
  targetId?: string | PopulatedTarget | null;
  targetModel?: string;
  details?: string;
  adminNote?: string;
  meta?: {
    targetName?: string;
    targetEmail?: string;
    itemTitle?: string;
    reason?: string;
    reportedBy?: string;
    action?: string;
  };
  createdAt: string;
}

interface PageState {
  logs: Log[];
  pages: number;
  loading: boolean;
}

const ACTION_MAP: Record<string, { label: string; color: string; icon: string }> = {
  BAN: {
    label: "حظر مستخدم",
    color: "text-red-600 bg-red-50 border-red-100",
    icon: "block",
  },
  UNBAN: {
    label: "رفع الحظر",
    color: "text-green-600 bg-green-50 border-green-100",
    icon: "check_circle",
  },
  ITEM_HIDE: {
    label: "حذف/إخفاء غرض",
    color: "text-orange-600 bg-orange-50 border-orange-100",
    icon: "visibility_off",
  },
  PROMOTE: {
    label: "ترقية مستخدم",
    color: "text-blue-600 bg-blue-50 border-blue-100",
    icon: "arrow_upward",
  },
  DEMOTE: {
    label: "تخفيض مستخدم",
    color: "text-purple-600 bg-purple-50 border-purple-100",
    icon: "arrow_downward",
  },
  HUB_MANAGE: {
    label: "إدارة مركز",
    color: "text-cyan-600 bg-cyan-50 border-cyan-100",
    icon: "warehouse",
  },
};

const REPORT_ACTION_MAP: Record<string, { label: string; color: string; icon: string }> = {
  "تحذير": {
    label: "تحذير على بلاغ",
    color: "text-yellow-700 bg-yellow-50 border-yellow-100",
    icon: "warning",
  },
  "حظر": {
    label: "حظر بسبب بلاغ",
    color: "text-red-600 bg-red-50 border-red-100",
    icon: "gavel",
  },
  "رفض البلاغ": {
    label: "رفض البلاغ",
    color: "text-gray-600 bg-gray-100 border-gray-200",
    icon: "cancel",
  },
};

function resolveAction(log: Log) {
  if (log.action === "REPORT_ACTION") {
    const subAction = log.meta?.action ?? "";
    return REPORT_ACTION_MAP[subAction] ?? {
      label: `إجراء على بلاغ${subAction ? ` (${subAction})` : ""}`,
      color: "text-yellow-700 bg-yellow-50 border-yellow-100",
      icon: "gavel",
    };
  }

  return ACTION_MAP[log.action] ?? {
    label: log.action,
    color: "text-gray-600 bg-gray-100 border-gray-200",
    icon: "info",
  };
}

function getPopulatedTarget(log: Log): PopulatedTarget | null {
  if (log.targetId && typeof log.targetId === "object") {
    return log.targetId;
  }
  return null;
}

function resolveTargetName(log: Log): string | null {
  if (log.meta?.targetName) return log.meta.targetName;

  const populated = getPopulatedTarget(log);
  if (populated?.name) return populated.name;
  if (populated?.title) return populated.title;

  return null;
}

function resolveTargetEmail(log: Log): string | null {
  if (log.meta?.targetEmail) return log.meta.targetEmail;

  const populated = getPopulatedTarget(log);
  if (populated?.email) return populated.email;

  return null;
}

function resolveReason(log: Log): string | null {
  return log.meta?.reason ?? null;
}

const COL_COUNT = 6;

export default function AdminLogsPage() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<PageState>({
    logs: [],
    pages: 1,
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true }));

    axiosInstance
      .get("/api/admin/logs", { params: { page }, signal: controller.signal })
      .then((r) =>
        setState({
          logs: r.data.logs,
          pages: r.data.pages,
          loading: false,
        })
      )
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setState((prev) => ({ ...prev, loading: false }));
        }
      });

    return () => controller.abort();
  }, [page]);

  const { logs, pages, loading } = state;

  const stats = useMemo(() => {
    const total = logs.length;
    const reportActions = logs.filter((l) => l.action === "REPORT_ACTION").length;
    const bans = logs.filter((l) => l.action === "BAN").length;
    const promotions = logs.filter((l) => l.action === "PROMOTE").length;
    const notes = logs.filter((l) => !!l.adminNote).length;

    return { total, reportActions, bans, promotions, notes };
  }, [logs]);

  return (
    <div
      dir="rtl"
      className="space-y-6 text-[#211d18]"
      style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
    >
      {/* Header */}
      <section className="relative overflow-hidden rounded-[32px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-7">
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

      {/* Table shell */}
      <section className="overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-[#f0ebe4] bg-[#faf8f4] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-black text-[#233433]">سجل الأنشطة الإدارية</h2>
            <p className="mt-1 text-xs leading-6 text-[#8a837a]">
              كل صف يمثل حدثًا مستقلًا مع الفاعل، الإجراء، المستهدف، والسياق المرتبط به.
            </p>
          </div>

          <div className="rounded-full border border-[#e9e3db] bg-white px-3 py-1 text-[11px] font-extrabold text-[#8e877f]">
            {logs.length} سجل
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-sm">
            <thead className="bg-white">
              <tr className="border-b border-[#f0ebe4] text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a39b92]">
                <th className="text-right p-4 whitespace-nowrap">الأدمن</th>
                <th className="text-right p-4 whitespace-nowrap">العملية</th>
                <th className="text-right p-4 whitespace-nowrap">المستهدف</th>
                <th className="text-right p-4 whitespace-nowrap">التفاصيل</th>
                <th className="text-right p-4 whitespace-nowrap">تعليق الأدمن</th>
                <th className="text-right p-4 whitespace-nowrap">التاريخ</th>
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#f5f1eb]">
                      {Array.from({ length: COL_COUNT }).map((_, j) => (
                        <td key={j} className="p-4">
                          <div className="h-4 rounded-full bg-[#f1ece5] animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : logs.length === 0 ? (
                    <tr>
                      <td colSpan={COL_COUNT} className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-[#b3aba1]">
                          <span className="material-symbols-outlined mb-3 text-5xl">
                            history_toggle_off
                          </span>
                          <p className="text-base font-black text-[#7b756d]">
                            لا توجد سجلات حالياً
                          </p>
                          <p className="mt-1 text-sm text-[#a39b92]">
                            لم يتم العثور على أحداث ضمن الصفحة الحالية.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const action = resolveAction(log);
                      const targetName = resolveTargetName(log);
                      const targetEmail = resolveTargetEmail(log);
                      const reason = resolveReason(log);

                      return (
                        <tr
                          key={log._id}
                          className="border-b border-[#f5f1eb] align-top transition-colors hover:bg-[#fcfaf7]"
                        >
                          {/* Admin */}
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                <span className="material-symbols-outlined text-primary text-[18px]">
                                  shield_person
                                </span>
                              </div>
                              <div>
                                <p className="text-[13px] font-black text-[#223433] whitespace-nowrap">
                                  {log.adminId?.name ?? "النظام"}
                                </p>
                                <p className="mt-0.5 text-[10px] font-bold tracking-[0.18em] text-[#b0a79d] uppercase">
                                  Actor
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-black whitespace-nowrap ${action.color}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {action.icon}
                              </span>
                              {action.label}
                            </span>
                          </td>

                          {/* Target */}
                          <td className="p-4">
                            {targetName ? (
                              <div className="space-y-1">
                                <p className="flex items-center gap-1.5 text-[12px] font-black text-[#243231]">
                                  <span className="material-symbols-outlined text-[14px] text-[#aaa197]">
                                    person
                                  </span>
                                  {targetName}
                                </p>

                                {targetEmail && (
                                  <p className="text-[11px] text-[#9b948c]">
                                    {targetEmail}
                                  </p>
                                )}

                                {log.meta?.itemTitle && (
                                  <div className="inline-flex items-center gap-1 rounded-full bg-[#f5f1eb] px-2.5 py-1 text-[10px] font-bold text-[#6a635d]">
                                    <span className="material-symbols-outlined text-[12px]">
                                      inventory_2
                                    </span>
                                    {log.meta.itemTitle}
                                  </div>
                                )}
                              </div>
                            ) : log.meta?.itemTitle ? (
                              <div className="space-y-1">
                                <p className="flex items-center gap-1.5 text-[12px] font-black text-[#243231]">
                                  <span className="material-symbols-outlined text-[14px] text-[#aaa197]">
                                    inventory_2
                                  </span>
                                  {log.meta.itemTitle}
                                </p>
                                <p className="text-[10px] font-bold tracking-[0.18em] text-[#b0a79d] uppercase">
                                  Item Target
                                </p>
                              </div>
                            ) : (
                              <span className="text-[#c2b8ae]">—</span>
                            )}
                          </td>

                          {/* Details */}
                          <td className="p-4 max-w-[260px]">
                            <div className="space-y-1.5 text-[12px] leading-6 text-[#6e675f]">
                              {reason && (
                                <p>
                                  <span className="text-[#a1988e]">السبب: </span>
                                  {reason}
                                </p>
                              )}

                              {log.meta?.reportedBy && (
                                <p>
                                  <span className="text-[#a1988e]">المُبلِّغ: </span>
                                  {log.meta.reportedBy}
                                </p>
                              )}

                              {log.action === "REPORT_ACTION" &&
                                log.meta?.action &&
                                !reason && (
                                  <p>
                                    <span className="text-[#a1988e]">الإجراء: </span>
                                    {log.meta.action}
                                  </p>
                                )}

                              {log.details && !reason && <p>{log.details}</p>}

                              {!reason && !log.meta?.reportedBy && !log.details && (
                                <span className="text-[#c2b8ae]">—</span>
                              )}
                            </div>
                          </td>

                          {/* Admin note */}
                          <td className="p-4 max-w-[240px]">
                            {log.adminNote ? (
                              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-[12px] leading-6 text-indigo-700">
                                <div className="mb-1 flex items-center gap-1 text-[11px] font-black">
                                  <span className="material-symbols-outlined text-[14px]">
                                    sticky_note_2
                                  </span>
                                  ملاحظة
                                </div>
                                <p>{log.adminNote}</p>
                              </div>
                            ) : (
                              <span className="text-[#c2b8ae] text-[12px]">—</span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <p className="text-[12px] font-black text-[#5e5852]">
                                {new Date(log.createdAt).toLocaleDateString("ar-EG")}
                              </p>
                              <p className="text-[11px] text-[#a39b92]">
                                {new Date(log.createdAt).toLocaleTimeString("ar-EG")}
                              </p>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-10 min-w-10 rounded-2xl px-3 text-sm font-black transition-all duration-300 ${
                page === p
                  ? "bg-primary text-white shadow-[0_10px_20px_rgba(1,105,111,0.18)]"
                  : "border border-[#e5dfd6] bg-white text-[#746e67] hover:bg-[#faf8f4]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}