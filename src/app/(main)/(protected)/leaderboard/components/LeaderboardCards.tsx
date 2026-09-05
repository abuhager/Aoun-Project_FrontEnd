import Image from "next/image";
import Link from "next/link";
import type { LeaderboardEntry } from "@/types/leaderboard.types";
import { medalColor, topCardBackground } from "./leaderboardPresentation";

export function ProgressBar({ value }: { value: number }) {
  return <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#ece8e1]"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.min(value, 100)}%` }} /></div>;
}

export function TopThreeCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <Link href={`/profile/${entry._id}`} className={`group relative overflow-hidden rounded-[20px] border p-5 shadow-[0_14px_35px_rgba(16,37,34,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(16,37,34,0.12)] ${entry.rank === 1 ? "md:-translate-y-3 md:hover:-translate-y-4" : ""} ${topCardBackground(entry.rank)}`}>
      <span className="absolute -left-8 -top-10 font-headline text-[7rem] font-black leading-none text-black/[0.025]">{entry.rank}</span>
      <div className="flex items-start justify-between">
        <div className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-black text-[#5f5952]"><span className={`material-symbols-outlined text-[16px] ${medalColor(entry.rank)}`} style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>المركز #{entry.rank}</div>
        <div className="text-left"><p className="text-lg font-black text-primary">{entry.trustScore}</p><p className="text-[10px] text-gray-400">نقطة ثقة</p></div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-black/[0.06] bg-white">{entry.avatar ? <Image src={entry.avatar} alt={entry.name} fill sizes="56px" className="object-cover" /> : <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[42px] text-primary">account_circle</span>}</div>
        <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="truncate text-sm font-black text-[#191c1d]">{entry.name}</p>{entry.badge && <span className="shrink-0 text-sm">{entry.badge}</span>}</div><p className="mt-0.5 truncate text-[11px] font-medium text-[#8b847c]">{entry.title || "عضو نشط"}</p></div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2"><div><p className="text-[10px] font-bold text-gray-400">إجمالي التبرعات</p><p className="text-sm font-black text-[#1d2324]">{entry.totalDonations}</p></div><div className="text-left"><p className="text-[10px] font-bold text-gray-400">الحالة</p><p className="text-sm font-black text-primary">متصدر</p></div></div>
    </Link>
  );
}
