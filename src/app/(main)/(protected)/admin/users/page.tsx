// src/app/(main)/(protected)/admin/users/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Image   from "next/image";
import axios   from "axios";
import axiosInstance from "@/lib/api/axiosInstance";

interface AdminUser {
  _id:            string;
  name:           string;
  email:          string;
  avatar?:        string;
  trustScore:     number;
  totalDonations: number;
  isBanned:       boolean;
  trustLevel:     number;
  createdAt:      string;
}

export default function AdminUsersPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

  const [users,   setUsers]   = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get("/api/admin/users", { params: { page, search } });
      setUsers(r.data.users);
      setPages(r.data.pages);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Ban / Unban ──────────────────────────────────────────────
  const handleBan = async (id: string, banned: boolean) => {
    try {
      await axiosInstance.post(
        `/api/admin/users/${id}/${banned ? "unban" : "ban"}`,
        banned ? {} : { reason: "مخالفة قوانين المنصة" }
      );
      showToast(banned ? "✅ تم رفع الحظر" : "🚫 تم حظر المستخدم", true);
      await loadUsers();
    } catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? err.response?.data?.msg ?? "حدث خطأ" : "حدث خطأ", false);
    }
  };

  // ── Promote / Demote ─────────────────────────────────────────
  const handlePromote = async (id: string) => {
    try {
      await axiosInstance.post(`/api/admin/users/${id}/promote`, {
        reason: "ترقية يدوية من الأدمن",
      });
      showToast("✅ تمت الترقية للمستوى 2", true);
      await loadUsers();
    } catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? err.response?.data?.msg ?? "حدث خطأ" : "حدث خطأ", false);
    }
  };

  const handleDemote = async (id: string) => {
    try {
      await axiosInstance.post(`/api/admin/users/${id}/demote`, {
        reason: "تخفيض يدوي من الأدمن",
      });
      showToast("✅ تم التخفيض للمستوى 1", true);
      await loadUsers();
    } catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? err.response?.data?.msg ?? "حدث خطأ" : "حدث خطأ", false);
    }
  };

  const getAvatar = (url?: string) =>
    url ? (url.startsWith("http") ? url : `${apiUrl}/${url}`) : null;

  return (
    <div dir="rtl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white transition-all ${
          toast.ok ? "bg-green-500" : "bg-red-500"
        }`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-xl font-black mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">group</span>
        المستخدمون
      </h1>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="ابحث باسم أو إيميل..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              <th className="text-right p-4">المستخدم</th>
              <th className="text-right p-4">نقاط الثقة</th>
              <th className="text-right p-4">التبرعات</th>
              <th className="text-right p-4">المستوى</th>
              <th className="text-right p-4">الحالة</th>
              <th className="p-4 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : users.map(u => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">

                    {/* المستخدم */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {getAvatar(u.avatar) ? (
                            <Image
                              src={getAvatar(u.avatar)!}
                              alt={u.name}
                              width={36} height={36}
                              className="object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-gray-400 text-lg">account_circle</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[13px]">{u.name}</p>
                          <p className="text-[11px] text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* نقاط الثقة */}
                    <td className="p-4 font-bold text-primary">{u.trustScore}</td>

                    {/* التبرعات */}
                    <td className="p-4 text-gray-600">{u.totalDonations}</td>

                    {/* المستوى + أزرار رفع/تخفيض */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                          u.trustLevel >= 2
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          Level {u.trustLevel}
                        </span>
                        {/* ✅ زر رفع المستوى */}
                        {u.trustLevel < 2 && (
                          <button
                            onClick={() => handlePromote(u._id)}
                            title="ترقية للمستوى 2"
                            className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center text-[10px] font-black"
                          >
                            ▲
                          </button>
                        )}
                        {/* ✅ زر تخفيض المستوى */}
                        {u.trustLevel >= 2 && (
                          <button
                            onClick={() => handleDemote(u._id)}
                            title="تخفيض للمستوى 1"
                            className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all flex items-center justify-center text-[10px] font-black"
                          >
                            ▼
                          </button>
                        )}
                      </div>
                    </td>

                    {/* الحالة */}
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                        u.isBanned
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}>
                        {u.isBanned ? "محظور" : "نشط"}
                      </span>
                    </td>

                    {/* إجراءات */}
                    <td className="p-4">
                      <button
                        onClick={() => handleBan(u._id, u.isBanned)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                          u.isBanned
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {u.isBanned ? "رفع الحظر" : "حظر"}
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold ${
                page === p
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-500"
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