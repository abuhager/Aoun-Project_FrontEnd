interface ProfileCardProps {
  name?: string;
  email?: string;
  trustScore?: number;
}

export function ProfileCard({
  name,
  email,
  trustScore = 0,
}: ProfileCardProps) {
  const trustLabel =
    trustScore >= 90
      ? "عضو موثوق"
      : trustScore >= 70
      ? "ثقة جيدة"
      : trustScore >= 40
      ? "قيد التحسين"
      : "ثقة منخفضة";

  return (
    <section className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-50 ring-4 ring-primary/5">
            <span className="material-symbols-outlined text-[38px] text-primary">
              account_circle
            </span>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-black text-[#1d2324] md:text-2xl">
              {name || "مستخدم"}
            </h1>
            <p className="mt-1 truncate text-xs font-medium text-[#8a847d]">
              {email || "لا يوجد بريد إلكتروني"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-black text-primary">
                <span className="material-symbols-outlined text-[14px]">
                  shield
                </span>
                {trustScore} نقطة ثقة
              </div>

              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ${
                  trustScore >= 90
                    ? "border border-blue-100 bg-blue-50 text-blue-700"
                    : trustScore >= 70
                    ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                    : trustScore >= 40
                    ? "border border-amber-100 bg-amber-50 text-amber-700"
                    : "border border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  verified
                </span>
                {trustLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#f8f6f2] px-4 py-3 text-center sm:min-w-[140px]">
          <p className="text-[11px] font-black text-[#9b948d]">حالة الحساب</p>
          <p className="mt-1 text-sm font-black text-[#1f2425]">
            {trustScore >= 90 ? "ممتاز" : trustScore >= 70 ? "جيد" : "نشط"}
          </p>
        </div>
      </div>
    </section>
  );
}