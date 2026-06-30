"use client";

import Image from "next/image";
import Link from "next/link";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { useSiteConfig } from "@/context/SiteConfigContext";

function medalColor(rank: number) {
  if (rank === 1) return "text-yellow-500";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-amber-600";
  return "text-gray-300";
}

function rowBg(rank: number) {
  if (rank === 1) return "bg-yellow-50 border border-yellow-200";
  if (rank === 2) return "bg-slate-50 border border-slate-200";
  if (rank === 3) return "bg-amber-50 border border-amber-200";
  return "bg-white border border-black/[0.06]";
}

function topCardBg(rank: number) {
  if (rank === 1) {
    return "border-yellow-200 bg-[linear-gradient(180deg,#fffbea_0%,#fffdf7_100%)]";
  }
  if (rank === 2) {
    return "border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]";
  }
  return "border-amber-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)]";
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-black/[0.06] bg-white p-4 animate-pulse">
      <div className="h-6 w-8 rounded bg-gray-200" />
      <div className="h-11 w-11 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 rounded bg-gray-200" />
        <div className="h-2.5 w-24 rounded bg-gray-100" />
      </div>
      <div className="h-4 w-16 rounded bg-gray-200" />
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#ece8e1]">
      <div
        className="h-full rounded-full bg-primary transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function TopThreeCard({
  rank,
  name,
  avatar,
  badge,
  title,
  trustScore,
  totalDonations,
  profileHref,
}: {
  rank: number;
  name: string;
  avatar?: string;
  badge?: string;
  title?: string;
  trustScore: number;
  totalDonations: number;
  profileHref: string;
}) {
  return (
    <Link
      href={profileHref}
      className={`group rounded-3xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${topCardBg(
        rank
      )}`}
    >
      <div className="flex items-start justify-between">
        <div className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-black text-[#5f5952]">
          <span
            className={`material-symbols-outlined text-[16px] ${medalColor(rank)}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            military_tech
          </span>
          المركز #{rank}
        </div>

        <div className="text-left">
          <p className="text-lg font-black text-primary">{trustScore}</p>
          <p className="text-[10px] text-gray-400">نقطة ثقة</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-black/[0.06] bg-white">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[42px] text-primary">
              account_circle
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-black text-[#191c1d]">{name}</p>
            {badge && <span className="shrink-0 text-sm">{badge}</span>}
          </div>
          <p className="mt-0.5 truncate text-[11px] font-medium text-[#8b847c]">
            {title || "عضو نشط"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2">
        <div>
          <p className="text-[10px] font-bold text-gray-400">إجمالي التبرعات</p>
          <p className="text-sm font-black text-[#1d2324]">{totalDonations}</p>
        </div>

        <div className="text-left">
          <p className="text-[10px] font-bold text-gray-400">الحالة</p>
          <p className="text-sm font-black text-primary">متصدر</p>
        </div>
      </div>
    </Link>
  );
}

export default function LeaderboardPage() {

    const { platformName } = useSiteConfig();

  const { leaderboard, myRank, loading } = useLeaderboard();

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div
      className="min-h-screen bg-[#f7f6f2] pb-20 font-body text-[#191c1d]"
      dir="rtl"
    >
      <main className="mx-auto max-w-5xl px-4 pt-20 md:px-6 md:pt-24">
        {/* ── Header ── */}
        <section className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-[11px] font-black text-yellow-700">
            <span className="material-symbols-outlined text-[15px]">
              workspace_premium
            </span>
            الترتيب المجتمعي
          </div>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                لوحة المتصدرين
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                أكثر الأعضاء نشاطاً وموثوقيةً على منصة {platformName}
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm border border-black/[0.06]">
              <p className="text-[10px] font-bold text-gray-400">نوع الترتيب</p>
              <p className="text-sm font-black text-[#1d2324]">
                حسب الثقة والتبرعات
              </p>
            </div>
          </div>
        </section>

        {/* ── My rank ── */}
        {!loading && myRank && (
          <section className="mb-6">
            <div className="rounded-3xl border border-primary/15 bg-white p-4 shadow-sm md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/8">
                  <span className="text-[10px] font-bold text-primary">
                    رتبتي
                  </span>
                  <span className="text-xl font-black leading-none text-primary">
                    #{myRank.rank}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-base">{myRank.badge}</span>
                    <span className="text-sm font-black">{myRank.title}</span>
                    <span className="text-[10px] font-normal text-gray-400">
                      · {myRank.trustScore} نقطة
                    </span>
                  </div>

                  <ProgressBar value={myRank.progress} />

                  <p className="mt-1 text-[10px] text-gray-400">
                    {myRank.pointsToNext
                      ? `${myRank.pointsToNext} نقطة للمستوى التالي`
                      : "وصلت للمستوى الأعلى 👑"}
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl bg-[#f8f6f2] px-4 py-3 text-center">
                  <p className="text-xl font-black text-primary">
                    {myRank.totalDonations}
                  </p>
                  <p className="text-[10px] text-gray-400">تبرع</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Top 3 ── */}
        {!loading && topThree.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-[#1d2324]">
                أصحاب المراكز الأولى
              </h2>
              <span className="text-[11px] font-bold text-gray-400">
                أعلى 3 أعضاء هذا الترتيب
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {topThree.map((entry) => (
                <TopThreeCard
                  key={entry._id}
                  rank={entry.rank}
                  name={entry.name}
                  avatar={entry.avatar}
                  badge={entry.badge}
                  title={entry.title}
                  trustScore={entry.trustScore}
                  totalDonations={entry.totalDonations}
                  profileHref={`/profile/${entry._id}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── List ── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-[#1f2425]">بقية الترتيب</h2>
            {!loading && (
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#6a645d] border border-black/[0.06] shadow-sm">
                {leaderboard.length} عضو
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : rest.map((entry) => (
                  <Link
                    key={entry._id}
                    href={`/profile/${entry._id}`}
                    className={`flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 hover:shadow-sm active:scale-[.99] ${rowBg(
                      entry.rank
                    )}`}
                  >
                    {/* Rank */}
                    <div className="w-9 shrink-0 text-center">
                      {entry.rank <= 3 ? (
                        <span
                          className={`material-symbols-outlined text-2xl ${medalColor(
                            entry.rank
                          )}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          military_tech
                        </span>
                      ) : (
                        <span className="text-sm font-black text-gray-400">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100">
                      {entry.avatar ? (
                        <Image
                          src={entry.avatar}
                          alt={entry.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-4xl text-primary">
                          account_circle
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-black">
                          {entry.name}
                        </span>
                        <span className="shrink-0 text-sm">{entry.badge}</span>
                        <span className="shrink-0 text-[10px] font-normal text-gray-400">
                          {entry.title}
                        </span>
                      </div>
                      <ProgressBar value={entry.progress} />
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-left">
                      <p className="text-sm font-black text-primary">
                        {entry.trustScore}
                        <span className="text-[10px] font-normal text-gray-400">
                          {" "}
                          نقطة
                        </span>
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {entry.totalDonations} تبرع
                      </p>
                    </div>
                  </Link>
                ))}
          </div>
        </section>

        {/* Empty state */}
        {!loading && leaderboard.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-black/[0.06]">
              <span className="material-symbols-outlined text-3xl text-gray-300">
                leaderboard
              </span>
            </div>
            <p className="text-sm font-bold text-gray-500">لا يوجد بيانات بعد</p>
          </div>
        )}
      </main>
    </div>
  );
}