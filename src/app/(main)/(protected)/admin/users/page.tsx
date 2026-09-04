"use client";

import PaginationControls from "@/components/ui/PaginationControls";
import AdminUsersTable from "./components/AdminUsersTable";
import UserActionDialog from "./components/UserActionDialog";
import { useAdminUsers } from "./hooks/useAdminUsers";

export default function AdminUsersPage() {
  const {
    busy,
    closeAction,
    confirmAction,
    getAvatar,
    loading,
    note,
    openAction,
    page,
    pages,
    pending,
    search,
    setNote,
    setPage,
    setSearch,
    stats,
    ToastComponent,
    users,
  } = useAdminUsers();

  return (
    <div
      dir="rtl"
      className="space-y-6 text-[#211d18]"
      style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
    >
      {ToastComponent}

      <UserActionDialog
        action={pending}
        note={note}
        busy={Boolean(pending && busy[pending.userId])}
        onNoteChange={setNote}
        onConfirm={confirmAction}
        onClose={closeAction}
      />

      {/* Hero */}
      <section className="admin-page-hero relative overflow-hidden rounded-[32px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-7">
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
              onChange={(event) => setSearch(event.target.value)}
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

      <AdminUsersTable
        users={users}
        loading={loading}
        busy={busy}
        getAvatar={getAvatar}
        onAction={openAction}
      />

      <PaginationControls
        page={page}
        totalPages={pages}
        onPageChange={setPage}
      />
    </div>
  );
}
