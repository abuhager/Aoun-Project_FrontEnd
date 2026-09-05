"use client";

import Link from "next/link";
import { DashboardItemCard } from "./DashboardItemCard";
import type { DashboardTab, ItemsTableProps } from "./dashboardItem.types";

export function ItemsTable(props: ItemsTableProps) {
  if (props.items.length === 0) return <EmptyState activeTab={props.activeTab} />;

  return (
    <div className="space-y-3">
      {props.items.map((item) => (
        <DashboardItemCard key={item._id} {...props} item={item} />
      ))}
    </div>
  );
}

function EmptyState({ activeTab }: { activeTab: DashboardTab }) {
  const isDonations = activeTab === "donations";
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#fcfbf8] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
        <span className="material-symbols-outlined text-[28px] text-gray-300" style={{ fontVariationSettings: "'FILL' 0" }}>
          {isDonations ? "volunteer_activism" : "inventory_2"}
        </span>
      </div>
      <p className="text-[15px] font-black text-gray-800">{isDonations ? "لم تضف أي تبرع بعد" : "لا توجد طلبات حالياً"}</p>
      <p className="mt-1.5 max-w-[30ch] text-[13px] leading-6 text-gray-500">
        {isDonations ? "ابدأ بإضافة غرض جديد ليظهر هنا وتتمكن من إدارة حالته بسهولة." : "تصفح العناصر المتاحة، وعند حجز أي غرض سيظهر هنا مباشرة."}
      </p>
      <Link href={isDonations ? "/add-item" : "/browse"} className="mt-5 inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-[13px] font-black text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98]">
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{isDonations ? "add_circle" : "explore"}</span>
        {isDonations ? "أضف تبرعاً" : "تصفح الأغراض"}
      </Link>
    </div>
  );
}

export type { DashboardItem, DeliveryState, ItemsTableProps } from "./dashboardItem.types";
