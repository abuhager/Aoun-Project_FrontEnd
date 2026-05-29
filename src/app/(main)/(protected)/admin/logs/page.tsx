"use client";

import { useEffect, useState } from "react";
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

  return (
    <div dir="rtl">
      <h1 className="text-xl font-black mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">history</span>
        سجل العمليات
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
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
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: COL_COUNT }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : logs.map((log) => {
                  const action = resolveAction(log);
                  const targetName = resolveTargetName(log);
                  const targetEmail = resolveTargetEmail(log);
                  const reason = resolveReason(log);

                  return (
                    <tr
                      key={log._id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-sm">
                              shield_person
                            </span>
                          </div>
                          <span className="font-bold text-[13px] text-gray-800 whitespace-nowrap">
                            {log.adminId?.name ?? "النظام"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border whitespace-nowrap ${action.color}`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {action.icon}
                          </span>
                          {action.label}
                        </span>
                      </td>

                      <td className="p-4">
                        {targetName ? (
                          <div>
                            <p className="text-[12px] font-bold text-gray-800 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-gray-400">
                                person
                              </span>
                              {targetName}
                            </p>

                            {targetEmail && (
                              <p className="text-[10px] text-gray-400 mt-0.5">{targetEmail}</p>
                            )}

                            {log.meta?.itemTitle && (
                              <p className="text-[10px] text-gray-500 mt-1">
                                <span className="text-gray-400">الغرض: </span>
                                {log.meta.itemTitle}
                              </p>
                            )}
                          </div>
                        ) : log.meta?.itemTitle ? (
                          <div>
                            <p className="text-[12px] font-bold text-gray-800 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-gray-400">
                                inventory_2
                              </span>
                              {log.meta.itemTitle}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      <td className="p-4 max-w-[240px]">
                        <div className="text-[12px] text-gray-500 leading-relaxed space-y-0.5">
                          {reason && (
                            <p>
                              <span className="text-gray-400">السبب: </span>
                              {reason}
                            </p>
                          )}

                          {log.meta?.reportedBy && (
                            <p>
                              <span className="text-gray-400">المُبلِّغ: </span>
                              {log.meta.reportedBy}
                            </p>
                          )}

                          {log.action === "REPORT_ACTION" &&
                            log.meta?.action &&
                            !reason && (
                              <p>
                                <span className="text-gray-400">الإجراء: </span>
                                {log.meta.action}
                              </p>
                            )}

                          {log.details && !reason && <p>{log.details}</p>}

                          {!reason && !log.meta?.reportedBy && !log.details && (
                            <span className="text-gray-300">—</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 max-w-[220px]">
                        {log.adminNote ? (
                          <p className="text-[12px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 leading-relaxed">
                            <span className="material-symbols-outlined text-[13px] align-middle ml-1">
                              sticky_note_2
                            </span>
                            {log.adminNote}
                          </p>
                        ) : (
                          <span className="text-gray-300 text-[12px]">—</span>
                        )}
                      </td>

                      <td className="p-4 text-[11px] text-gray-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("ar-EG")}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                page === p
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
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