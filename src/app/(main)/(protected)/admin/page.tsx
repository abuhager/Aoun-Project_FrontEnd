"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api/adminApi";
import type { AdminStats } from "@/types/admin.types";

const CARDS = [
  {
    key: "totalUsers",
    label: "إجمالي المستخدمين",
    icon: "group",
    iconWrap: "bg-blue-50 text-blue-600",
  },
  {
    key: "bannedUsers",
    label: "محظورون",
    icon: "block",
    iconWrap: "bg-red-50 text-red-600",
  },
  {
    key: "totalItems",
    label: "إجمالي الأغراض",
    icon: "inventory_2",
    iconWrap: "bg-primary/10 text-primary",
  },
  {
    key: "deliveredItems",
    label: "تم تسليمها",
    icon: "check_circle",
    iconWrap: "bg-green-50 text-green-600",
  },
  {
    key: "pendingReports",
    label: "بلاغات معلّقة",
    icon: "flag",
    iconWrap: "bg-orange-50 text-orange-600",
  },
] as const;

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div dir="rtl" className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[32px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f5ef_100%)] p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)] md:p-8">
        <div className="absolute left-0 top-0 h-40 w-40 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-40 w-40 translate-x-1/3 translate-y-1/3 rounded-full bg-[#005a8c]/5 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white text-primary shadow-[0_8px_24px_rgba(15,23,42,0.08)] ring-1 ring-[#efe8de]">
              <span className="material-symbols-outlined text-[26px]">
                dashboard
              </span>
            </div>

            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-extrabold tracking-[0.16em] text-primary">
                ADMIN OVERVIEW
              </div>

              <h1 className="text-2xl font-black tracking-tight text-[#1f312f] md:text-[2rem]">
                نظرة عامة
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7a746d]">
                متابعة سريعة وواضحة لأهم مؤشرات المنصة، مع توزيع بصري أذكى يسهّل
                قراءة الحالة العامة فورًا.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-2xl border border-[#ece6de] bg-white/80 px-4 py-3 shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              monitoring
            </span>
            <span className="text-xs font-bold text-[#6a655e]">
              مؤشرات مباشرة ومحدّثة
            </span>
          </div>
        </div>
      </section>

      {/* Loading Bento */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="h-[220px] animate-pulse rounded-[28px] border border-[#ece7df] bg-white lg:col-span-5" />
          <div className="h-[220px] animate-pulse rounded-[28px] border border-[#ece7df] bg-white lg:col-span-3" />
          <div className="h-[220px] animate-pulse rounded-[28px] border border-[#ece7df] bg-white lg:col-span-4" />
          <div className="h-[180px] animate-pulse rounded-[28px] border border-[#ece7df] bg-white lg:col-span-6" />
          <div className="h-[180px] animate-pulse rounded-[28px] border border-[#ece7df] bg-white lg:col-span-6" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* 1 — Main KPI */}
          <article className="group relative overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(15,23,42,0.08)] lg:col-span-5">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-l from-transparent via-primary/20 to-transparent" />
            <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-blue-100/40 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${CARDS[0].iconWrap}`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {CARDS[0].icon}
                  </span>
                </div>

                <span className="rounded-full border border-[#ece6de] bg-[#faf8f4] px-3 py-1 text-[10px] font-extrabold tracking-[0.18em] text-[#9a9289]">
                  PRIMARY KPI
                </span>
              </div>

              <div className="mt-10">
                <p className="tabular-nums text-5xl font-black leading-none tracking-tight text-[#1f312f]">
                  {stats?.[CARDS[0].key as keyof AdminStats] ?? 0}
                </p>
                <p className="mt-3 text-sm font-bold text-[#7b756e]">
                  {CARDS[0].label}
                </p>
              </div>
            </div>
          </article>

          {/* 2 */}
          <article className="group rounded-[28px] border border-[#e8e2d9] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.07)] lg:col-span-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${CARDS[1].iconWrap}`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {CARDS[1].icon}
              </span>
            </div>

            <div className="mt-8">
              <p className="tabular-nums text-3xl font-black leading-none tracking-tight text-[#1f312f]">
                {stats?.[CARDS[1].key as keyof AdminStats] ?? 0}
              </p>
              <p className="mt-3 text-xs font-bold text-[#8b847c]">
                {CARDS[1].label}
              </p>
            </div>
          </article>

          {/* 3 */}
          <article className="group rounded-[28px] border border-[#e8e2d9] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.07)] lg:col-span-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${CARDS[2].iconWrap}`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {CARDS[2].icon}
              </span>
            </div>

            <div className="mt-8">
              <p className="tabular-nums text-4xl font-black leading-none tracking-tight text-[#1f312f]">
                {stats?.[CARDS[2].key as keyof AdminStats] ?? 0}
              </p>
              <p className="mt-3 text-xs font-bold text-[#8b847c]">
                {CARDS[2].label}
              </p>
            </div>
          </article>

          {/* 4 */}
          <article className="group rounded-[28px] border border-[#e8e2d9] bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.07)] lg:col-span-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${CARDS[3].iconWrap}`}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {CARDS[3].icon}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-black text-[#233433]">
                    {CARDS[3].label}
                  </p>
                  <p className="mt-1 text-xs text-[#938c84]">
                    العمليات المكتملة
                  </p>
                </div>
              </div>

              <p className="tabular-nums text-4xl font-black tracking-tight text-[#1f312f]">
                {stats?.[CARDS[3].key as keyof AdminStats] ?? 0}
              </p>
            </div>
          </article>

          {/* 5 */}
          <article className="group rounded-[28px] border border-[#e8e2d9] bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.07)] lg:col-span-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${CARDS[4].iconWrap}`}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {CARDS[4].icon}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-black text-[#233433]">
                    {CARDS[4].label}
                  </p>
                  <p className="mt-1 text-xs text-[#938c84]">
                    تحتاج متابعة سريعة
                  </p>
                </div>
              </div>

              <p className="tabular-nums text-4xl font-black tracking-tight text-[#1f312f]">
                {stats?.[CARDS[4].key as keyof AdminStats] ?? 0}
              </p>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
