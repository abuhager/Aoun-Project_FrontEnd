import Image from "next/image";
import Link from "next/link";
import { DashboardItemActions } from "./DashboardItemActions";
import { DashboardItemBadges } from "./DashboardItemBadges";
import type { DashboardItemCardProps } from "./dashboardItem.types";

export function DashboardItemCard(props: DashboardItemCardProps) {
  const { item, activeTab } = props;
  return (
    <div className="group rounded-3xl border border-black/[0.06] bg-white p-4 shadow-sm transition-all duration-200 hover:border-black/[0.08] hover:shadow-md" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-gray-50">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.title} fill sizes="64px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="material-symbols-outlined text-[26px] text-gray-300" style={{ fontVariationSettings: "'FILL' 0" }}>inventory_2</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <Link href={`/items/${item._id}`} className="block truncate text-[15px] font-black text-gray-900 transition-colors duration-150 hover:text-primary">{item.title}</Link>
              <DashboardItemBadges item={item} activeTab={activeTab} />
            </div>
            <div className="text-[11px] font-bold text-gray-400">{activeTab === "donations" ? "عنصر متبرع به" : "عنصر محجوز"}</div>
          </div>
        </div>

        <DashboardItemActions {...props} />
      </div>
    </div>
  );
}
