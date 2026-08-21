"use client";

import Link from "next/link";
import Image from "next/image";
import { usePublicProfile } from "./hooks/usePublicProfile";

// ─── خريطة الـ Badges ───────────────────────────────────────
const BADGE_META: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  first_donation: {
    label: "المتبرع الأول",
    icon: "volunteer_activism",
    color: "text-emerald-700 bg-emerald-50 border-emerald-100",
  },
  trusted_donor: {
    label: "متبرع موثوق",
    icon: "verified_user",
    color: "text-blue-700 bg-blue-50 border-blue-100",
  },
  super_donor: {
    label: "متبرع متميز",
    icon: "workspace_premium",
    color: "text-purple-700 bg-purple-50 border-purple-100",
  },
  quick_receiver: {
    label: "استلام سريع",
    icon: "bolt",
    color: "text-yellow-700 bg-yellow-50 border-yellow-100",
  },
  community_hero: {
    label: "بطل المجتمع",
    icon: "emoji_events",
    color: "text-orange-700 bg-orange-50 border-orange-100",
  },
};

function StatCard({
  value,
  label,
  tone = "text-primary",
}: {
  value: string | number;
  label: string;
  tone?: string;
}) {
  return (
    <div className="rounded-3xl border border-black/[0.06] bg-white p-4 text-center shadow-sm">
      <p className={`text-2xl font-black md:text-3xl ${tone}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold tracking-wide text-gray-400">
        {label}
      </p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#ece8e1]">
      <div
        className="h-full rounded-full bg-primary transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export default function PublicProfilePage() {
  const {
    profileData,
    activeTab,
    setActiveTab,
    loading,
    error,
    activeItems,
    trustScore,
    gamification,
    averageRating,
    totalItems,
    totalPages,
    page,
    setPage,
    getImageUrl,
    renderStars,
  } = usePublicProfile();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] py-20 text-center">
        <div className="mt-32">
          <span className="material-symbols-outlined mb-3 block text-5xl text-gray-300">
            person_off
          </span>
          <p className="text-sm font-bold text-red-500">🛑 {error || "هذا الحساب غير موجود"}</p>
          <Link
            href="/browse"
            className="mt-4 inline-block text-xs font-bold text-primary underline"
          >
            العودة للتصفح
          </Link>
        </div>
      </div>
    );
  }

  const { user, stats } = profileData;

  return (
    <div
      className="min-h-screen bg-[#f7f6f2] pb-20 font-body text-[#191c1d]"
      dir="rtl"
    >
      <main className="mx-auto max-w-6xl px-4 pt-20 md:px-6 md:pt-24">
        {/* ─── Header shell ─── */}
        <section className="mb-8 rounded-[32px] border border-black/[0.06] bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            {/* Avatar */}
            <div className="mx-auto lg:mx-0">
              <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#f7f6f2] bg-slate-50 ring-4 ring-primary/5 md:h-32 md:w-32">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-7xl text-primary">
                    account_circle
                  </span>
                )}
              </div>
            </div>

            {/* Identity */}
            <div className="text-center lg:text-right">
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <h1 className="text-2xl font-black md:text-3xl">{user.name}</h1>

                {user.isVerifiedStudent && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700"
                    title="طالب جامعي"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      school
                    </span>
                    طالب جامعي
                  </span>
                )}

                {trustScore >= 110 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                    <span className="material-symbols-outlined text-[13px]">
                      verified
                    </span>
                    عضو موثوق
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-col items-center gap-1 lg:items-start">
                <div className="flex gap-0.5">
                  {renderStars(averageRating).map(({ key, filled }) => (
                    <span
                      key={key}
                      className={`material-symbols-outlined text-[16px] ${
                        filled ? "text-yellow-400" : "text-gray-200"
                      }`}
                      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
                    >
                      star
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <span className="text-yellow-600">
                    {(averageRating / 2).toFixed(1)} / 5
                  </span>
                  <span className="font-normal text-gray-400">
                    ({stats?.totalRatings ?? 0} تقييم)
                  </span>
                </div>

                <p className="mt-1 text-[11px] italic text-gray-500">
                  انضم لعون في {new Date(user.createdAt).getFullYear()}
                </p>
              </div>
            </div>

            {/* CTA / trust summary */}
            <div className="flex flex-col items-center gap-3 lg:items-end">
              <div className="rounded-2xl bg-[#f8f6f2] px-4 py-3 text-center">
                <p className="text-[10px] font-bold text-gray-400">نقاط الثقة</p>
                <p className="text-2xl font-black text-primary">{trustScore}</p>
              </div>

            </div>
          </div>
        </section>

        {/* ─── Stats + level ─── */}
        <section className="mb-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="grid grid-cols-3 gap-3">
            <StatCard value={trustScore} label="نقاط الثقة" tone="text-primary" />
            <StatCard
              value={stats?.donationsCount ?? 0}
              label="إجمالي العطاء"
              tone="text-emerald-600"
            />
            <StatCard
              value={stats?.receivedCount ?? 0}
              label="أغراض مستلمة"
              tone="text-[#005a8c]"
            />
          </div>

          {gamification ? (
            <div className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-primary">
                    military_tech
                  </span>
                  <span className="text-sm font-black">
                    {gamification.badge} المستوى {gamification.level} — {gamification.title}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400">
                  {gamification.trustScore} نقطة
                </span>
              </div>

              <ProgressBar value={gamification.progress} />

              {(user.badges?.length ?? 0) > 0 && (
                <div className="mt-4">
                  <p className="mb-3 flex items-center gap-1 text-xs font-black text-gray-500">
                    <span className="material-symbols-outlined text-sm">
                      emoji_events
                    </span>
                    الإنجازات ({user.badges.length})
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge) => {
                      const meta = BADGE_META[badge] ?? {
                        label: badge,
                        icon: "star",
                        color: "text-gray-600 bg-gray-50 border-gray-200",
                      };

                      return (
                        <span
                          key={badge}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold ${meta.color}`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {meta.icon}
                          </span>
                          {meta.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-[#1f2425]">معلومات النشاط</p>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                هذا العضو يشارك في مجتمع عون، ويمكنك استعراض نشاطه العام من خلال
                سجل التبرعات والعناصر المستلمة أدناه.
              </p>
            </div>
          )}
        </section>

        {/* ─── Activity ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 rounded-2xl border border-black/[0.06] bg-white p-1 shadow-sm">
              {(["donations", "received"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-black transition-all ${
                    activeTab === tab
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  {tab === "donations" ? "سجل التبرعات" : "أغراض استلمها"}
                </button>
              ))}
            </div>

            <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#6a645d] border border-black/[0.06] shadow-sm">
              {totalItems} عنصر
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {activeItems.map((item) => (
              <Link
                key={item._id}
                href={`/items/${item._id}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative h-40 overflow-hidden bg-gray-50">
                  <Image
                    src={getImageUrl(item.imageUrl)}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                      item.status === "تم التسليم"
                        ? "grayscale-[0.5] opacity-80"
                        : ""
                    }`}
                  />

                  <div className="absolute right-3 top-3">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[9px] font-black text-white backdrop-blur-md ${
                        item.status === "تم التسليم"
                          ? "bg-gray-500/80"
                          : item.status === "محجوز"
                          ? "bg-[#005a8c]/80"
                          : "bg-primary/80"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="mb-1 truncate text-sm font-bold text-[#191c1d]">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span className="material-symbols-outlined text-xs">
                      calendar_today
                    </span>
                    {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {activeItems.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-[#fcfbf8] py-20 text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-gray-300">
                inventory_2
              </span>
              <p className="text-sm font-bold text-gray-400">
                لا يوجد سجلات لعرضها حالياً.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-full border border-black/[0.08] bg-white px-4 py-2 text-xs font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                السابق
              </button>
              <span className="text-xs font-bold text-gray-500">
                صفحة {page} من {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="rounded-full border border-black/[0.08] bg-white px-4 py-2 text-xs font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
