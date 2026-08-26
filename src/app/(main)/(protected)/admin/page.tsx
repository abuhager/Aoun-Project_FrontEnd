"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api/adminApi";
import type { AdminStats } from "@/types/admin.types";
import PageIntro from "@/components/ui/PageIntro";

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
    const controller = new AbortController();
    getAdminStats(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setStats(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setStats(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <div dir="rtl" className="mx-auto w-full max-w-7xl space-y-6">
      <PageIntro
        eyebrow="ADMIN OVERVIEW"
        title="مركز متابعة المنصة"
        description="قراءة مباشرة لحجم المجتمع، التبرعات المكتملة، والحالات التي تحتاج تدخلًا إداريًا."
        icon="space_dashboard"
        tone="admin"
        meta={
          <>
            <span className="data-chip">
              <span className="material-symbols-outlined text-[15px]">monitoring</span>
              مؤشرات مباشرة ومحدّثة
            </span>
            <span className="data-chip">
              <span className="material-symbols-outlined text-[15px]">shield</span>
              وصول إداري محمي
            </span>
          </>
        }
      />

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
          <article className="content-panel group relative overflow-hidden p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(15,23,42,0.08)] lg:col-span-5">
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
          <article className="content-panel group p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.07)] lg:col-span-3">
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
          <article className="content-panel group p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.07)] lg:col-span-4">
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
          <article className="content-panel group p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.07)] lg:col-span-6">
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
          <article className="content-panel group p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.07)] lg:col-span-6">
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
