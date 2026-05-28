// src/app/(main)/(protected)/leaderboard/page.tsx
"use client";

import Image from "next/image";
import Link  from "next/link";
import { useLeaderboard } from "./hooks/useLeaderboard";

function medalColor(rank: number) {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-400";
  if (rank === 3) return "text-amber-600";
  return "text-gray-300";
}

function rowBg(rank: number) {
  if (rank === 1) return "bg-yellow-50  border border-yellow-200";
  if (rank === 2) return "bg-gray-50    border border-gray-200";
  if (rank === 3) return "bg-amber-50   border border-amber-200";
  return "bg-white border border-gray-100";
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 animate-pulse">
      <div className="w-8 h-5  rounded bg-gray-200" />
      <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 rounded bg-gray-200" />
        <div className="h-2.5 w-20 rounded bg-gray-100" />
      </div>
      <div className="w-14 h-4 rounded bg-gray-200" />
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function LeaderboardPage() {
  const { leaderboard, myRank, loading } = useLeaderboard();

  return (
    <div className="bg-surface min-h-screen pb-20 text-[#191c1d] font-body" dir="rtl">
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-2xl mx-auto">

        {/* ── Header ── */}
        <section className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-50 border border-yellow-200 mb-3">
            <span className="text-3xl">🏆</span>
          </div>
          <h1 className="text-2xl font-black">لوحة المتصدرين</h1>
          <p className="text-sm text-gray-400 mt-1">
            أكثر المتبرعين نشاطاً وموثوقيةً في عون
          </p>
        </section>

        {/* ── بطاقة رتبتي ── */}
        {!loading && myRank && (
          <section className="mb-6">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-primary">رتبتي</span>
                <span className="text-xl font-black text-primary leading-none">#{myRank.rank}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">{myRank.badge}</span>
                  <span className="text-sm font-black">{myRank.title}</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    · {myRank.trustScore} نقطة
                  </span>
                </div>
                <ProgressBar value={myRank.progress} />
                <p className="text-[10px] text-gray-400 mt-1">
                  {myRank.pointsToNext
                    ? `${myRank.pointsToNext} نقطة للمستوى التالي`
                    : "وصلت للمستوى الأعلى 👑"}
                </p>
              </div>

              <div className="shrink-0 text-center">
                <p className="text-xl font-black text-primary">{myRank.totalDonations}</p>
                <p className="text-[10px] text-gray-400">تبرع</p>
              </div>
            </div>
          </section>
        )}

        {/* ── القائمة ── */}
        <section className="space-y-2">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : leaderboard.map((entry) => (
                <Link
                  key={entry._id}
                  href={`/profile/${entry._id}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[.98] hover:shadow-sm ${rowBg(entry.rank)}`}
                >
                  {/* رتبة */}
                  <div className="w-8 shrink-0 text-center">
                    {entry.rank <= 3 ? (
                      <span
                        className={`material-symbols-outlined text-2xl ${medalColor(entry.rank)}`}
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

                  {/* صورة */}
                  <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-100 shrink-0">
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

                  {/* اسم + مستوى + progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[13px] font-black truncate">{entry.name}</span>
                      <span className="text-sm shrink-0">{entry.badge}</span>
                      <span className="text-[10px] text-gray-400 font-normal shrink-0">
                        {entry.title}
                      </span>
                    </div>
                    <ProgressBar value={entry.progress} />
                  </div>

                  {/* نقاط + تبرعات */}
                  <div className="shrink-0 text-left">
                    <p className="text-sm font-black text-primary">
                      {entry.trustScore}
                      <span className="text-[10px] font-normal text-gray-400"> نقطة</span>
                    </p>
                    <p className="text-[10px] text-gray-400">{entry.totalDonations} تبرع</p>
                  </div>
                </Link>
              ))}
        </section>

        {/* Empty state */}
        {!loading && leaderboard.length === 0 && (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">leaderboard</span>
            <p className="text-gray-400 text-sm font-bold">لا يوجد بيانات بعد</p>
          </div>
        )}
      </main>
    </div>
  );
}