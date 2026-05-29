"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axiosInstance";

interface Stats {
  totalUsers: number;
  bannedUsers: number;
  totalItems: number;
  deliveredItems: number;
  pendingReports: number;
}

const CARDS = [
  {
    key: "totalUsers",
    label: "إجمالي المستخدمين",
    icon: "group",
    color: "text-blue-600 bg-blue-50",
  },
  {
    key: "bannedUsers",
    label: "محظورون",
    icon: "block",
    color: "text-red-600 bg-red-50",
  },
  {
    key: "totalItems",
    label: "إجمالي الأغراض",
    icon: "inventory_2",
    color: "text-primary bg-primary/8",
  },
  {
    key: "deliveredItems",
    label: "تم تسليمها",
    icon: "check_circle",
    color: "text-green-600 bg-green-50",
  },
  {
    key: "pendingReports",
    label: "بلاغات معلّقة",
    icon: "flag",
    color: "text-orange-600 bg-orange-50",
  },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/admin/stats")
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-black mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">dashboard</span>
        نظرة عامة
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CARDS.map(({ key, label, icon, color }) => (
            <div
              key={key}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {icon}
                </span>
              </div>

              <p className="text-2xl font-black">
                {stats?.[key as keyof Stats] ?? 0}
              </p>
              <p className="text-[10px] text-gray-400 font-bold mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}