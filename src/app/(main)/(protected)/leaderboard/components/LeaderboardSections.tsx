import Image from "next/image";
import Link from "next/link";
import type { LeaderboardEntry, MyRank } from "@/types/leaderboard.types";
import { ProgressBar, TopThreeCard } from "./LeaderboardCards";
import { medalColor, rowBackground } from "./leaderboardPresentation";

export function MyRankCard({ rank }: { rank: MyRank }) {
  return <section><div className="content-panel relative overflow-hidden p-4 md:p-5"><span className="absolute inset-y-0 right-0 w-1.5 bg-primary" /><div className="flex flex-col gap-4 md:flex-row md:items-center"><div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/8"><span className="text-[10px] font-bold text-primary">رتبتي</span><span className="text-xl font-black leading-none text-primary">#{rank.rank}</span></div><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-1.5"><span className="text-base">{rank.badge}</span><span className="text-sm font-black">{rank.title}</span><span className="text-[10px] font-normal text-gray-400">· {rank.trustScore} نقطة</span></div><ProgressBar value={rank.progress} /><p className="mt-1 text-[10px] text-gray-400">{rank.pointsToNext ? `${rank.pointsToNext} نقطة للمستوى التالي` : "وصلت للمستوى الأعلى 👑"}</p></div><div className="shrink-0 rounded-xl bg-primary-softer px-5 py-3 text-center"><p className="text-xl font-black text-primary">{rank.totalDonations}</p><p className="text-[10px] text-gray-400">تبرع</p></div></div></div></section>;
}

export function EligibilityNotice() {
  return <section><div className="flex items-start gap-3 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800"><span className="material-symbols-outlined mt-0.5 text-[20px]">info</span><div><p className="text-sm font-black">حسابك غير مشمول في الترتيب</p><p className="mt-0.5 text-xs font-medium text-amber-700">يمكنك مشاهدة اللوحة، لكن الترتيب مخصص لحسابات المستخدمين المفعّلة وغير المحظورة.</p></div></div></section>;
}

export function TopContributors({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) return null;
  return <section className="pt-2"><div className="mb-7 flex items-end justify-between"><div><span className="section-kicker">TOP CONTRIBUTORS</span><h2 className="mt-1 text-xl font-black text-on-surface">أصحاب المراكز الأولى</h2></div><span className="text-[11px] font-bold text-gray-400">أعلى 3 أعضاء</span></div><div className="grid gap-4 pt-3 md:grid-cols-3">{entries.map((entry) => <TopThreeCard key={entry._id} entry={entry} />)}</div></section>;
}

function SkeletonRow() {
  return <div className="flex animate-pulse items-center gap-4 border-b border-black/[0.06] bg-white p-4 last:border-b-0"><div className="h-6 w-8 rounded bg-gray-200" /><div className="h-11 w-11 shrink-0 rounded-full bg-gray-200" /><div className="flex-1 space-y-2"><div className="h-3.5 w-32 rounded bg-gray-200" /><div className="h-2.5 w-24 rounded bg-gray-100" /></div><div className="h-4 w-16 rounded bg-gray-200" /></div>;
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return <Link href={`/profile/${entry._id}`} className={`flex items-center gap-4 border-b p-4 transition-colors duration-200 last:border-b-0 hover:bg-primary-softer/70 ${rowBackground(entry.rank)}`}><div className="w-9 shrink-0 text-center">{entry.rank <= 3 ? <span className={`material-symbols-outlined text-2xl ${medalColor(entry.rank)}`} style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span> : <span className="text-sm font-black text-gray-400">#{entry.rank}</span>}</div><div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100">{entry.avatar ? <Image src={entry.avatar} alt={entry.name} fill sizes="44px" className="object-cover" /> : <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-4xl text-primary">account_circle</span>}</div><div className="min-w-0 flex-1"><div className="mb-0.5 flex items-center gap-1.5"><span className="truncate text-[13px] font-black">{entry.name}</span><span className="shrink-0 text-sm">{entry.badge}</span><span className="shrink-0 text-[10px] font-normal text-gray-400">{entry.title}</span></div><ProgressBar value={entry.progress} /></div><div className="shrink-0 text-left"><p className="text-sm font-black text-primary">{entry.trustScore}<span className="text-[10px] font-normal text-gray-400"> نقطة</span></p><p className="text-[10px] text-gray-400">{entry.totalDonations} تبرع</p></div></Link>;
}

export function LeaderboardList({ entries, loading, totalCount }: { entries: LeaderboardEntry[]; loading: boolean; totalCount: number }) {
  return <section className="content-panel overflow-hidden"><div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4"><div><span className="section-kicker">COMMUNITY RANKING</span><h2 className="mt-1 text-base font-black text-on-surface">بقية الترتيب</h2></div>{!loading && <span className="rounded-lg bg-surface-container-low px-3 py-1.5 text-[11px] font-black text-on-surface-variant">{totalCount} عضو</span>}</div><div>{loading ? Array.from({ length: 8 }).map((_, index) => <SkeletonRow key={index} />) : entries.map((entry) => <LeaderboardRow key={entry._id} entry={entry} />)}</div></section>;
}

export function LeaderboardEmpty() {
  return <div className="content-panel py-20 text-center"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-sm"><span className="material-symbols-outlined text-3xl text-gray-300">leaderboard</span></div><p className="text-sm font-bold text-gray-500">لا يوجد بيانات بعد</p></div>;
}
