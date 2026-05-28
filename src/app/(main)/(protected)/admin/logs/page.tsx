// src/app/(main)/(protected)/admin/logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axiosInstance";

interface Log {
  _id: string;
  adminId: { name: string };
  action:  string;
  targetId: string;
  details?: string;
  createdAt: string;
}

const ACTION_COLOR: Record<string, string> = {
  ban_user:    "text-red-600    bg-red-50",
  unban_user:  "text-green-600  bg-green-50",
  delete_item: "text-orange-600 bg-orange-50",
  PROMOTE:     "text-blue-600   bg-blue-50",
  DEMOTE:      "text-purple-600 bg-purple-50",
};

export default function AdminLogsPage() {
  const [logs,    setLogs]    = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get("/api/admin/logs", { params: { page } })
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              <th className="text-right p-4">الأدمن</th>
              <th className="text-right p-4">العملية</th>
              <th className="text-right p-4">التفاصيل</th>
              <th className="text-right p-4">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="p-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : logs.map(log => (
              <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-4 font-bold text-[13px]">{log.adminId?.name}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${ACTION_COLOR[log.action] ?? "text-gray-600 bg-gray-100"}`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-[12px] text-gray-500">{log.details ?? "—"}</td>
                <td className="p-4 text-[11px] text-gray-400">
                  {new Date(log.createdAt).toLocaleString("ar-EG")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold ${
                page === p ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-500"
              }`}
            >{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}