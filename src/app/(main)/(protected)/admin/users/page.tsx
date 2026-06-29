"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import axiosInstance from "@/lib/api/axiosInstance";
import { useToast } from "@/hooks/useToast";
import type { AdminUser } from "@/types/admin.types";

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

  const getAvatar = (url?: string) =>
    url ? (url.startsWith("http") ? url : apiUrl + url) : null;

  const getUserId = (user: AdminUser) =>
    ((user as AdminUser & { _id?: string; id?: string })._id ??
      (user as AdminUser & { _id?: string; id?: string }).id ??
      "");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get("/api/admin/users", {
        params: { page, search },
      });
      setUsers(r.data.users);
      setPages(r.data.pages);
    } catch {
      showToast("تعذر تحميل المستخدمين", false);
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openConfirm = (u: AdminUser, type: PendingAction["type"]) => {
    setPending({
      userId: getUserId(u),
      userName: u.name,
      type,
    });
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
          reason: note || undefined,
          adminNote: note || undefined,
        });

        showToast("تم حظر المستخدم بنجاح", true);

        setUsers((prev) =>
          prev.map((u) =>
            getUserId(u) === userId ? { ...u, isBanned: true } : u
          )
        );
      } else if (type === "unban") {
        await axiosInstance.post(`/api/admin/users/${userId}/unban`, {
          adminNote: note || undefined,
        });

        showToast("تم فك الحظر بنجاح", true);

        setUsers((prev) =>
          prev.map((u) =>
            getUserId(u) === userId ? { ...u, isBanned: false } : u
          )
        );
      } else if (type === "promote") {
        const res = await axiosInstance.post(
          `/api/admin/users/${userId}/promote`,
          {
            reason: note || undefined,
            adminNote: note || undefined,
          }
        );

        const newLevel = res.data.user?.trustLevel ?? 2;

        showToast(`تمت ترقية المستخدم إلى المستوى ${newLevel}`, true);

        setUsers((prev) =>
          prev.map((u) =>
            getUserId(u) === userId ? { ...u, trustLevel: newLevel } : u
          )
        );
      } else if (type === "demote") {
        const res = await axiosInstance.post(
          `/api/admin/users/${userId}/demote`,
          {
            reason: note || undefined,
            adminNote: note || undefined,
          }
        );

        const newLevel = res.data.user?.trustLevel ?? 1;

        showToast(`تم تخفيض المستخدم إلى المستوى ${newLevel}`, true);

        setUsers((prev) =>
          prev.map((u) =>
            getUserId(u) === userId ? { ...u, trustLevel: newLevel } : u
          )
        );
      }
    } catch (err: unknown) {
      let msg = "حدث خطأ أثناء تنفيذ الإجراء";

      if (err && typeof err === "object" && "isAxiosError" in err) {
        const axiosError = err as { response?: { data?: { msg?: string } } };
        msg = axiosError.response?.data?.msg ?? msg;
      }

      showToast(msg, false);
    } finally {
      setBusy((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const ACTION_LABELS: Record<
    PendingAction["type"],
    { title: string; btn: string; btnColor: string; icon: string; tone: string }
  > = {
    ban: {
      title: "تأكيد حظر المستخدم",
      btn: "تأكيد الحظر",
      btnColor: "bg-red-600 hover:bg-red-700 text-white",
      icon: "block",
      tone: "bg-red-50 text-red-600",
    },
    unban: {
      title: "تأكيد فك الحظر",
      btn: "فك الحظر",
      btnColor: "bg-green-600 hover:bg-green-700 text-white",
      icon: "verified",
      tone: "bg-green-50 text-green-600",
    },
    promote: {
      title: "تأكيد ترقية المستخدم",
      btn: "ترقية إلى Level 2",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: "arrow_upward",
      tone: "bg-blue-50 text-blue-600",
    },
    demote: {
      title: "تأكيد تخفيض المستخدم",
      btn: "تخفيض إلى Level 1",
      btnColor: "bg-orange-500 hover:bg-orange-600 text-white",
      icon: "arrow_downward",
      tone: "bg-orange-50 text-orange-600",
    },
  };

  const stats = useMemo(() => {
    const total = users.length;
    const banned = users.filter((u) => u.isBanned).length;
    const active = users.filter((u) => !u.isBanned).length;
    const lvl3 = users.filter((u) => u.trustLevel === 3).length;
    const lvl2 = users.filter((u) => u.trustLevel === 2).length;
    const lvl1 = users.filter((u) => u.trustLevel === 1).length;
    return { total, banned, active, lvl1, lvl2, lvl3 };
  }, [users]);

  return (
    <div
      dir="rtl"
      className="space-y-6 text-[#211d18]"
      style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
    >
      {ToastComponent}

      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1815]/45 p-4 backdrop-blur-sm"
          onClick={() => setPending(null)}
        >
          <div
            className="w-full max-w-md rounded-[30px] border border-white/50 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${ACTION_LABELS[pending.type].tone}`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {ACTION_LABELS[pending.type].icon}
                </span>
              </div>

              <div>
                <h2 className="text-base font-black text-[#1f312f]">
                  {ACTION_LABELS[pending.type].title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#7c766f]">
                  المستخدم:{" "}
                  <span className="font-black text-[#263735]">
                    {pending.userName}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-[#8a837b]">
                ملاحظة إدارية <span className="font-normal">(اختياري)</span>
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="أدخل سبب الإجراء أو أي ملاحظة داخلية..."
                className="w-full rounded-2xl border border-[#e7e1d8] bg-[#fcfaf7] px-4 py-3 text-sm text-[#24302f] outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={confirmAction}
                className={`flex-1 rounded-2xl py-3 text-sm font-black transition-all duration-300 ${ACTION_LABELS[pending.type].btnColor}`}
              >
                {ACTION_LABELS[pending.type].btn}
              </button>
              <button
                onClick={() => setPending(null)}
                className="flex-1 rounded-2xl bg-[#f3f0ea] py-3 text-sm font-black text-[#5f5a54] transition-all duration-300 hover:bg-[#eae5dd]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-7">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-[#005a8c]/[0.05] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-extrabold text-primary">
              <span className="material-symbols-outlined text-[15px]">group</span>
              Trust & User Moderation
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#1f312f] md:text-[2rem]">
              إدارة المستخدمين
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7a746d]">
              واجهة موحّدة لمراجعة المستخدمين، مراقبة مستويات الثقة، وتنفيذ
              الإجراءات الإدارية بطريقة أوضح وأكثر هدوءًا بصريًا.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            {[
              { icon: "manage_accounts", label: "إدارة الحسابات" },
              { icon: "shield", label: "مراقبة الثقة" },
              { icon: "policy", label: "إجراءات محكومة" },
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

      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:col-span-5">
          <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-primary/5 blur-3xl" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[24px]">
                groups
              </span>
            </div>

            <span className="rounded-full border border-[#ece6de] bg-[#faf8f4] px-3 py-1 text-[10px] font-extrabold tracking-[0.18em] text-[#9a9289]">
              OVERVIEW
            </span>
          </div>

          <div className="mt-10">
            <p className="text-5xl font-black leading-none tracking-tight text-[#1f312f]">
              {stats.total}
            </p>
            <p className="mt-3 text-sm font-bold text-[#7b756e]">
              عدد المستخدمين في الصفحة الحالية
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              {stats.active} نشط
            </span>
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              {stats.banned} محظور
            </span>
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-[11px] font-black text-[#6e675f]">
              صفحة {page} من {pages}
            </span>
          </div>
        </div>

        {[
          {
            label: "نشط",
            value: stats.active,
            icon: "verified_user",
            wrap: "bg-green-50 text-green-700",
            span: "lg:col-span-2",
          },
          {
            label: "محظور",
            value: stats.banned,
            icon: "gpp_bad",
            wrap: "bg-red-50 text-red-600",
            span: "lg:col-span-2",
          },
          {
            label: "Level 2",
            value: stats.lvl2,
            icon: "military_tech",
            wrap: "bg-blue-50 text-blue-600",
            span: "lg:col-span-1",
          },
          {
            label: "Level 3",
            value: stats.lvl3,
            icon: "workspace_premium",
            wrap: "bg-purple-50 text-purple-600",
            span: "lg:col-span-1",
          },
          {
            label: "Level 1",
            value: stats.lvl1,
            icon: "counter_1",
            wrap: "bg-slate-100 text-slate-600",
            span: "lg:col-span-1",
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
              <p className="mt-2 text-sm font-bold text-[#7a746d]">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Toolbar */}
      <section className="rounded-[26px] border border-[#e8e2d9] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9b948b]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
              className="w-full rounded-2xl border border-[#e8e2d9] bg-[#fcfaf7] py-3 pl-4 pr-10 text-sm text-[#263735] outline-none transition-all duration-300 placeholder:text-[#b1a99f] focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl bg-[#f7f4ee] px-4 py-2 text-xs font-extrabold text-[#7c766f]">
              عدد النتائج: <span className="text-[#1f312f]">{users.length}</span>
            </div>
            <div className="rounded-2xl bg-[#f7f4ee] px-4 py-2 text-xs font-extrabold text-[#7c766f]">
              الصفحة: <span className="text-[#1f312f]">{page}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-[#f0ebe4] bg-[#faf8f4] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-black text-[#233433]">قائمة المستخدمين</h2>
            <p className="mt-1 text-xs leading-6 text-[#8a837a]">
              راقب الثقة، التبرعات، حالة الحظر، ثم نفّذ الإجراء من نفس الصف.
            </p>
          </div>

          <div className="rounded-full border border-[#e9e3db] bg-white px-3 py-1 text-[11px] font-extrabold text-[#8e877f]">
            {users.length} مستخدم
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full text-sm">
            <thead className="bg-white">
              <tr className="border-b border-[#f0ebe4] text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a39b92]">
                <th className="p-4 text-right">المستخدم</th>
                <th className="p-4 text-right">نقاط الثقة</th>
                <th className="p-4 text-right">التبرعات</th>
                <th className="p-4 text-right">المستوى</th>
                <th className="p-4 text-right">الحالة</th>
                <th className="p-4 text-right">الإجراء الرئيسي</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#f5f1eb]">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 animate-pulse rounded-full bg-[#f1ece5]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-[#b3aba1]">
                      <span className="material-symbols-outlined mb-3 text-5xl">
                        group_off
                      </span>
                      <p className="text-base font-black text-[#7b756d]">
                        لا يوجد مستخدمون
                      </p>
                      <p className="mt-1 text-sm text-[#a39b92]">
                        لم يتم العثور على نتائج مطابقة لعملية البحث الحالية.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const avatarUrl = getAvatar(u.avatar);
                  const userId = getUserId(u);

                  return (
                    <tr
                      key={userId || `${u.email}-${u.name}`}
                      className="border-b border-[#f5f1eb] align-middle transition-colors hover:bg-[#fcfaf7]"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ece6de] bg-[#f2eee7]">
                            {avatarUrl ? (
                              <Image
                                src={avatarUrl}
                                alt={u.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[#a39b92]">
                                account_circle
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#223433]">
                              {u.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-[#9b948c]">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/5 px-3 py-2">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            shield
                          </span>
                          <span className="text-sm font-black text-primary">
                            {u.trustScore}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex rounded-2xl bg-[#f5f1eb] px-3 py-2 text-xs font-black text-[#5f5a54]">
                          {u.totalDonations} تبرع
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-xl px-3 py-1.5 text-[11px] font-black ${
                              u.trustLevel === 3
                                ? "bg-purple-50 text-purple-600"
                                : u.trustLevel === 2
                                ? "bg-blue-50 text-blue-600"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            Level {u.trustLevel}
                          </span>

                          {u.trustLevel === 1 && (
                            <button
                              onClick={() => openConfirm(u, "promote")}
                              disabled={busy[userId]}
                              title="ترقية إلى Level 2"
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-100 disabled:opacity-40"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                arrow_upward
                              </span>
                            </button>
                          )}

                          {u.trustLevel > 1 && (
                            <button
                              onClick={() => openConfirm(u, "demote")}
                              disabled={busy[userId]}
                              title="تخفيض إلى Level 1"
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-100 disabled:opacity-40"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                arrow_downward
                              </span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-xl px-3 py-1.5 text-[11px] font-black ${
                            u.isBanned
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {u.isBanned ? "محظور" : "نشط"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              openConfirm(u, u.isBanned ? "unban" : "ban")
                            }
                            disabled={busy[userId]}
                            className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all duration-300 disabled:opacity-40 ${
                              u.isBanned
                                ? "bg-green-50 text-green-600 hover:bg-green-100"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                          >
                            {busy[userId]
                              ? "..."
                              : u.isBanned
                              ? "فك الحظر"
                              : "حظر"}
                          </button>
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