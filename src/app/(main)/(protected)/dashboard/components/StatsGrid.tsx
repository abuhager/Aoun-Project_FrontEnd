// src/app/(main)/(protected)/dashboard/components/StatsGrid.tsx  ✅ REDESIGNED

interface StatsGridProps {
  trustScore?: number;
  quota?: number;
  donationsCount: number;
}

export function StatsGrid({
  trustScore = 0,
  quota = 0,
  donationsCount,
}: StatsGridProps) {
  const quotaUsed = Math.min(quota, 2);
  const quotaFree = 2 - quotaUsed;

  return (
    <section className="grid grid-cols-3 gap-3">

      {/* نقاط الثقة */}
      <div
        className="relative overflow-hidden rounded-2xl border border-black/[0.06]
                   bg-white p-4 shadow-sm transition-all duration-200
                   hover:shadow-md hover:shadow-black/[0.05]"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br
                     from-primary/[0.05] to-transparent"
        />
        <div className="relative">
          <div
            className="mb-3 flex h-8 w-8 items-center justify-center
                       rounded-xl bg-primary/[0.08]"
          >
            <span
              className="material-symbols-outlined text-[18px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
          </div>
          <p className="text-2xl font-black tabular-nums text-primary">
            {trustScore}
          </p>
          <p className="mt-0.5 text-[11px] font-bold text-gray-400">نقاط الثقة</p>
        </div>
      </div>

      {/* الكوتا */}
      <div
        className="relative overflow-hidden rounded-2xl border border-black/[0.06]
                   bg-white p-4 shadow-sm transition-all duration-200
                   hover:shadow-md hover:shadow-black/[0.05]"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br
                     from-blue-500/[0.04] to-transparent"
        />
        <div className="relative">
          <div
            className="mb-3 flex h-8 w-8 items-center justify-center
                       rounded-xl bg-blue-50"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-500"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              bookmark
            </span>
          </div>
          {/* دوائر الكوتا */}
          <div className="flex items-center gap-1.5 mb-1">
            {[0, 1].map(i => (
              <div
                key={i}
                className={`h-2.5 w-2.5 rounded-full border transition-colors duration-300
                            ${i < quotaUsed
                              ? 'border-blue-400 bg-blue-400'
                              : 'border-gray-200 bg-gray-100'
                            }`}
              />
            ))}
            <span className="text-xs font-black text-blue-600 mr-1">
              {quotaFree} متاح
            </span>
          </div>
          <p className="text-[11px] font-bold text-gray-400">حجوزات نشطة</p>
        </div>
      </div>

      {/* التبرعات */}
      <div
        className="relative overflow-hidden rounded-2xl border border-black/[0.06]
                   bg-white p-4 shadow-sm transition-all duration-200
                   hover:shadow-md hover:shadow-black/[0.05]"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br
                     from-emerald-500/[0.04] to-transparent"
        />
        <div className="relative">
          <div
            className="mb-3 flex h-8 w-8 items-center justify-center
                       rounded-xl bg-emerald-50"
          >
            <span
              className="material-symbols-outlined text-[18px] text-emerald-600"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volunteer_activism
            </span>
          </div>
          <p className="text-2xl font-black tabular-nums text-emerald-600">
            {donationsCount}
          </p>
          <p className="mt-0.5 text-[11px] font-bold text-gray-400">تبرعاتك</p>
        </div>
      </div>

    </section>
  );
}