// src/app/(main)/(protected)/admin/logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axiosInstance";

interface Log {
  _id:        string;
  adminId:    { _id: string; name: string };
  action:     string;
  targetId:   string;
  targetModel?: string;
  details?:   string;
  meta?: {
    targetName?:  string;
    reason?:      string;
    reportedBy?:  string;
    // ✅ نوع الإجراء على البلاغ: "تحذير" | "حظر" | "رفض البلاغ"
    action?:      string;
  };
  createdAt:  string;
}

const ACTION_MAP: Record<string, { label: string; color: string; icon: string }> = {
  BAN:           { label: "حظر مستخدم",     color: "text-red-600 bg-red-50 border-red-100",          icon: "block"          },
  UNBAN:         { label: "رفع الحظر",       color: "text-green-600 bg-green-50 border-green-100",    icon: "check_circle"   },
  ITEM_HIDE:     { label: "إخفاء غرض",      color: "text-orange-600 bg-orange-50 border-orange-100", icon: "visibility_off" },
  PROMOTE:       { label: "ترقية مستخدم",   color: "text-blue-600 bg-blue-50 border-blue-100",       icon: "arrow_upward"   },
  DEMOTE:        { label: "تخفيض مستخدم",   color: "text-purple-600 bg-purple-50 border-purple-100", icon: "arrow_downward" },
  HUB_MANAGE:    { label: "إدارة مركز",     color: "text-cyan-600 bg-cyan-50 border-cyan-100",       icon: "warehouse"      },
  // ✅ REPORT_ACTION يُعالَج ديناميكياً حسب meta.action — لا نضعه هنا
};

// ✅ خريطة نوع الإجراء على البلاغ
const REPORT_ACTION_MAP: Record<string, { label: string; color: string; icon: string }> = {
  "تحذير":       { label: "تحذير على بلاغ",  color: "text-yellow-700 bg-yellow-50 border-yellow-100", icon: "warning"     },
  "حظر":         { label: "حظر بسبب بلاغ",   color: "text-red-600 bg-red-50 border-red-100",          icon: "gavel"       },
  "رفض البلاغ":  { label: "رفض البلاغ",      color: "text-gray-600 bg-gray-100 border-gray-200",      icon: "cancel"      },
};

// ✅ دالة تُرجع config العملية مع دعم REPORT_ACTION الديناميكي
function resolveAction(log: Log) {
  if (log.action === "REPORT_ACTION") {
    const subAction = log.meta?.action ?? "";
    return REPORT_ACTION_MAP[subAction] ?? {
      label: `إجراء على بلاغ${subAction ? ` (${subAction})` : ""}`,
      color: "text-yellow-700 bg-yellow-50 border-yellow-100",
      icon:  "gavel",
    };
  }
  return ACTION_MAP[log.action] ?? {
    label: log.action,
    color: "text-gray-600 bg-gray-100 border-gray-200",
    icon:  "info",
  };
}

export default function AdminLogsPage() {
  const [logs,    setLogs]    = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/api/admin/logs", { params: { page } })
      .then(r => { setLogs(r.data.logs); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-xl font-black mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">history</span>
        سجل العمليات
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              <th className="text-right p-4">الأدمن</th>
              <th className="text-right p-4">العملية</th>
              <th className="text-right p-4">المستهدف</th>
              <th className="text-right p-4">التفاصيل</th>
              <th className="text-right p-4">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : logs.map(log => {
                  const action = resolveAction(log);  // ✅ ديناميكي

                  return (
                    <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">

                      {/* الأدمن */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-sm">shield_person</span>
                          </div>
                          <span className="font-bold text-[13px] text-gray-800">
                            {log.adminId?.name ?? "النظام"}
                          </span>
                        </div>
                      </td>

                      {/* العملية */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border ${action.color}`}>
                          <span className="material-symbols-outlined text-[13px]">{action.icon}</span>
                          {action.label}
                        </span>
                      </td>

                      {/* المستهدف */}
                      <td className="p-4 text-[12px] text-gray-700 font-semibold">
                        {log.meta?.targetName ?? <span className="text-gray-300">—</span>}
                      </td>

                      {/* التفاصيل */}
                      <td className="p-4 max-w-[220px]">
                        <div className="text-[12px] text-gray-500 leading-relaxed">
                          {log.meta?.reason && (
                            <p><span className="text-gray-400">السبب:</span> {log.meta.reason}</p>
                          )}
                          {log.meta?.reportedBy && (
                            <p><span className="text-gray-400">المُبلِّغ:</span> {log.meta.reportedBy}</p>
                          )}
                          {/* ✅ عرض نوع الإجراء على البلاغ في التفاصيل إذا لم يكن في السبب */}
                          {log.action === "REPORT_ACTION" && log.meta?.action && !log.meta?.reason && (
                            <p><span className="text-gray-400">الإجراء:</span> {log.meta.action}</p>
                          )}
                          {log.details && !log.meta?.reason && (
                            <p>{log.details}</p>
                          )}
                          {!log.details && !log.meta?.reason && !log.meta?.reportedBy && (
                            <span className="text-gray-300">—</span>
                          )}
                        </div>
                      </td>

                      {/* التاريخ */}
                      <td className="p-4 text-[11px] text-gray-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("ar-EG")}
                      </td>

                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                page === p
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}