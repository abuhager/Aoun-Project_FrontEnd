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

  const cards = [
    {
      icon: "shield",
      value: trustScore,
      label: "نقاط الثقة",
      tone: "text-primary",
      iconBg: "bg-primary/[0.08]",
      iconColor: "text-primary",
      accent: "from-primary/[0.05]",
    },
    {
      icon: "bookmark",
      value: `${quotaFree}`,
      label: "حجوزات متاحة",
      tone: "text-blue-600",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      accent: "from-blue-500/[0.04]",
      helper: (
        <div className="mt-1 flex items-center gap-1.5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-full border ${
                i < quotaUsed
                  ? "border-blue-400 bg-blue-400"
                  : "border-gray-200 bg-gray-100"
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      icon: "volunteer_activism",
      value: donationsCount,
      label: "تبرعاتك",
      tone: "text-emerald-600",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accent: "from-emerald-500/[0.04]",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-black/[0.05]"
        >
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} to-transparent`}
          />

          <div className="relative">
            <div
              className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${card.iconColor}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {card.icon}
              </span>
            </div>

            <p className={`text-2xl font-black tabular-nums ${card.tone}`}>
              {card.value}
            </p>

            <p className="mt-0.5 text-[11px] font-bold text-gray-400">
              {card.label}
            </p>

            {"helper" in card && card.helper}
          </div>
        </div>
      ))}
    </section>
  );
}