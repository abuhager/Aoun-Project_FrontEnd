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
  const availableRequests = Math.max(0, quota);

  const cards = [
    {
      icon: "shield",
      value: trustScore,
      label: "نقاط الثقة",
      detail: "ترتفع مع إتمام التبادل",
      iconClassName: "bg-primary-soft text-primary",
    },
    {
      icon: "bookmark",
      value: availableRequests,
      label: "رصيد الطلبات المتاح",
      detail: "طلبات يمكنك حجزها الآن",
      iconClassName: "bg-info-bg text-info",
    },
    {
      icon: "volunteer_activism",
      value: donationsCount,
      label: "تبرعاتك",
      detail: "إجمالي الأغراض المضافة",
      iconClassName: "bg-success-bg text-success",
    },
  ];

  return (
    <section aria-label="ملخص الحساب" className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
      {cards.map((card) => (
        <div
          key={card.label}
          className="surface-card flex items-center gap-3.5 p-4 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md"
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}
          >
            <span
              className="material-symbols-outlined text-[21px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {card.icon}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-xs font-black text-on-surface-variant">
                {card.label}
              </p>
              <p className="text-2xl font-black tabular-nums text-on-surface">{card.value}</p>
            </div>
            <p className="mt-1 truncate text-[10px] font-medium text-on-surface-soft">
              {card.detail}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
