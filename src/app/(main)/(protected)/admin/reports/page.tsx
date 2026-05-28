// src/app/(main)/(protected)/admin/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axiosInstance";

interface Report {
  _id: string;
  reporter:     { name: string };
  reportedUser: { name: string };
  reason:       string;
  status:       string;
  createdAt:    string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get("/api/admin/reports");
      setReports(r.data.reports);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const resolve = async (id: string, action: string) => {
    await axiosInstance.post(`/api/admin/reports/${id}/resolve`, { action });
    fetch();
  };

  return (
    <div>
      <h1 className="text-xl font-black mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">flag</span>
        البلاغات المعلّقة
      </h1>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">check_circle</span>
            <p className="text-gray-400 text-sm font-bold">لا توجد بلاغات معلّقة 🎉</p>
          </div>
        ) : reports.map(r => (
          <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-black">
                <span className="text-primary">{r.reporter?.name}</span>
                <span className="text-gray-400 font-normal mx-2">أبلغ عن</span>
                <span className="text-red-500">{r.reportedUser?.name}</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">{r.reason}</p>
              <p className="text-[10px] text-gray-300 mt-1">{new Date(r.createdAt).toLocaleDateString("ar-EG")}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resolve(r._id, "warn")}
                className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-xl text-[11px] font-black hover:bg-yellow-100">
                تحذير
              </button>
              <button onClick={() => resolve(r._id, "ban")}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[11px] font-black hover:bg-red-100">
                حظر + حل
              </button>
              <button onClick={() => resolve(r._id, "dismiss")}
                className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-xl text-[11px] font-black hover:bg-gray-100">
                رفض
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}