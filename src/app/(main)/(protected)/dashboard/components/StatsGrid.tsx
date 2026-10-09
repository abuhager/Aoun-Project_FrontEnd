import type { MyItemsResponse } from "@/types/item.types";

interface StatsGridProps {
  trustScore?: number;
  usage?: MyItemsResponse["usage"];
  donationsCount: number;
}

export function StatsGrid({
  trustScore = 0,
  usage,
  donationsCount,
}: StatsGridProps) {
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
      value: usage ? `${usage.bookings.used} / ${usage.bookings.limit}` : "—",
      label: "الحجوزات النشطة",
      detail: !usage ? "تعذر تحميل حدود الحجز" : usage.bookings.eligible
        ? `يمكنك حجز ${usage.bookings.remaining} أغراض إضافية` : "حسابك غير مؤهل للحجز حاليًا",
      iconClassName: "bg-info-bg text-info",
    },
    {
      icon: "calendar_month",
      value: usage ? `${usage.requests.used} / ${usage.requests.limit}` : "—",
      label: "طلبات الاحتياج هذا الشهر",
      detail: !usage ? "تعذر تحميل حدود الطلبات" : !usage.requests.enabled
        ? "قسم الطلبات متوقف مؤقتًا" : !usage.requests.eligible
          ? "حسابك غير مؤهل لإنشاء الطلبات حاليًا"
          : `متبقي ${usage.requests.remaining} طلب في ${usage.requests.month}`,
      iconClassName: "bg-info-bg text-info",
    },
    {
      icon: "volunteer_activism",
      value: usage?.donationsTotal ?? donationsCount,
      label: "تبرعاتك",
      detail: "إجمالي الأغراض المضافة",
      iconClassName: "bg-success-bg text-success",
    },
  ];

  return (
    <section aria-label="ملخص الحساب" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
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
