// src/app/(main)/(protected)/admin/users/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import axiosInstance from "@/lib/api/axiosInstance";
import { useToast } from "@/hooks/useToast";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  trustScore: number;
  totalDonations: number;
  isBanned: boolean;
  trustLevel: number;
  createdAt: string;
}

type PendingAction = {
  userId: string;
  userName: string;
  type: "ban" | "unban" | "promote" | "demote";
};

export default function AdminUsersPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [note, setNote] = useState("");

  const { show: showToast, ToastComponent } = useToast();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get("/api/admin/users", {
        params: { page, search },
      });
      setUsers(r.data.users);
      setPages(r.data.pages);
    } catch {
      showToast("تعذر تحميل قائمة المستخدمين", false);
    } finally { // ✅ تم إصلاح الإملاء هنا
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openConfirm = (u: AdminUser, type: PendingAction["type"]) => {
    setPending({ userId: u._id, userName: u.name, type });
    setNote("");
  };

  const confirmAction = async () => {
    if (!pending) return;

    const { userId, type } = pending;
    if (busy[userId]) return;

    setBusy((prev) => ({ ...prev, [userId]: true }));
    setPending(null);

    try {
      if (type === "ban") {
        await axiosInstance.post(`/api/admin/users/${userId}/ban`, {
          reason: note || "مخالفة قوانين المنصة",
          adminNote: note || null,
        });

        showToast("🚫 تم حظر حساب المستخدم بنجاح", true);
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isBanned: true } : u)));
      } else if (type === "unban") {
        await axiosInstance.post(`/api/admin/users/${userId}/unban`, {
          adminNote: note || null,
        });

        showToast("✅ تم رفع الحظر عن حساب المستخدم بنجاح", true);
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isBanned: false } : u)));
      } else if (type === "promote") {
        await axiosInstance.post(`/api/admin/users/${userId}/promote`, {
          reason: note || "ترقية يدوية من الأدمن",
          adminNote: note || null,
        });

        showToast("✅ تمت ترقية المستخدم إلى المستوى 2 بنجاح", true);
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, trustLevel: 2 } : u)));
      } else if (type === "demote") {
        await axiosInstance.post(`/api/admin/users/${userId}/demote`, {
          reason: note || "تخفيض يدوي من الأدمن",
          adminNote: note || null,
        });

        showToast("✅ تم تخفيض المستخدم إلى المستوى 1 بنجاح", true);
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, trustLevel: 1 } : u)));
      }
    } catch (err: unknown) {
      let msg = "حدث خطأ أثناء تنفيذ الإجراء";
      if (err && typeof err === "object" && "isAxiosError" in err) {
        const axiosError = err as { response?: { data?: { msg?: string } } };
        msg = axiosError.response?.data?.msg || msg;
      }
      showToast(msg, false);
    } finally { // ✅ تم إصلاح الإملاء هنا
      setBusy((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const ACTION_LABELS: Record<PendingAction["type"], { title: string; btn: string; btnColor: string }> = {
    ban: { title: "تأكيد الحظر", btn: "حظر المستخدم", btnColor: "bg-red-600 hover:bg-red-700 text-white" },
    unban: { title: "تأكيد رفع الحظر", btn: "رفع الحظر", btnColor: "bg-green-600 hover:bg-green-700 text-white" },
    promote: { title: "تأكيد الترقية", btn: "ترقية للمستوى 2", btnColor: "bg-blue-600 hover:bg-blue-700 text-white" },
    demote: { title: "تأكيد التخفيض", btn: "تخفيض للمستوى 1", btnColor: "bg-orange-50 hover:bg-orange-600 text-white" },
  };

  const getAvatar = (url?: string) =>
    url ? (url.startsWith("http") ? url : `${apiUrl}/${url}`) : null;

  return (
    <div dir="rtl">
      {ToastComponent}

      {/* Confirmation Modal */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setPending(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-black text-gray-800">{ACTION_LABELS[pending.type].title}</h2>
            <p className="text-[13px] text-gray-500">المستخدم: <span className="font-bold text-gray-800">{pending.userName}</span></p>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500">تعليق الأدمن <span className="font-normal text-gray-400">(اختياري)</span></label>
              <textarea
                rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="أضف ملاحظة أو سبب للإجراء..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={confirmAction} className={`flex-1 py-2.5 rounded-xl text-[13px] font-black transition-all ${ACTION_LABELS[pending.type].btnColor}`}>
                {ACTION_LABELS[pending.type].btn}
              </button>
              <button onClick={() => setPending(null)} className="flex-1 py-2.5 rounded-xl text-[13px] font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-xl font-black mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">group</span>
        المستخدمون
      </h1>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ابحث باسم أو إيميل..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

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
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="p-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  <span className="material-symbols-outlined text-4xl block mb-2">group_off</span>لا يوجد مستخدمون
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const avatarUrl = getAvatar(u.avatar);
                return (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* ✅ تم تحديث الكلاس هنا إلى shrink-0 بناءً على انتيليسينس */}
                        <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                          {avatarUrl ? (
                            <Image src={avatarUrl} alt={u.name} width={36} height={36} className="object-cover w-full h-full" />
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
                    <td className="p-4 font-bold text-primary">{u.trustScore}</td>
                    <td className="p-4 text-gray-600">{u.totalDonations}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${u.trustLevel >= 2 ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                          Level {u.trustLevel}
                        </span>
                        {u.trustLevel < 2 && (
                          <button onClick={() => openConfirm(u, "promote")} disabled={busy[u._id]} title="ترقية للمستوى 2" className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-40 transition-all flex items-center justify-center text-[10px] font-black">▲</button>
                        )}
                        {u.trustLevel >= 2 && (
                          <button onClick={() => openConfirm(u, "demote")} disabled={busy[u._id]} title="تخفيض للمستوى 1" className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-40 transition-all flex items-center justify-center text-[10px] font-black">▼</button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${u.isBanned ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                        {u.isBanned ? "محظور" : "نشط"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => openConfirm(u, u.isBanned ? "unban" : "ban")} disabled={busy[u._id]}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black disabled:opacity-40 transition-all ${u.isBanned ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                      >
                        {busy[u._id] ? "..." : u.isBanned ? "رفع الحظر" : "حظر"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === p ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}