export function medalColor(rank: number) {
  if (rank === 1) return "text-yellow-500";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-amber-600";
  return "text-gray-300";
}

export function rowBackground(rank: number) {
  if (rank === 1) return "border-yellow-200/80 bg-yellow-50/70";
  if (rank === 2) return "border-slate-200 bg-slate-50/70";
  if (rank === 3) return "border-amber-200 bg-amber-50/70";
  return "border-black/[0.055] bg-white";
}

export function topCardBackground(rank: number) {
  if (rank === 1) return "border-yellow-200 bg-[linear-gradient(180deg,#fffbea_0%,#fffdf7_100%)]";
  if (rank === 2) return "border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]";
  return "border-amber-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)]";
}
