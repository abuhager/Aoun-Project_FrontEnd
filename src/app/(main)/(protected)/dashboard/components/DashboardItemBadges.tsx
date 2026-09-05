import { getBookedByName, type DashboardItem, type DashboardTab } from "./dashboardItem.types";

export function DashboardItemBadges({ item, activeTab }: { item: DashboardItem; activeTab: DashboardTab }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <StatusBadge status={item.status} />
      {item.status === "محجوز" && activeTab === "requests" && (
        <StateBadge icon={item.recipientConfirmed ? "schedule" : "touch_app"} color={item.recipientConfirmed ? "amber" : "blue"}>
          {item.recipientConfirmed ? "بانتظار تأكيد المتبرع" : "بانتظار تأكيدك للاستلام"}
        </StateBadge>
      )}
      {item.status === "تم التسليم" && !item.isRated && (
        <span className="rounded-lg border border-orange-100 bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600">⭐ بانتظار تقييمك</span>
      )}
      {activeTab === "donations" && item.status === "محجوز" && item.bookedBy && (
        <span className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-600">بواسطة: {getBookedByName(item.bookedBy)}</span>
      )}
      {item.reportId && (
        <StateBadge icon="warning" color="red">بلاغ معلّق</StateBadge>
      )}
    </div>
  );
}

function StateBadge({ icon, color, children }: { icon: string; color: "amber" | "blue" | "red"; children: React.ReactNode }) {
  const colors = {
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    red: "border-red-100 bg-red-50 text-red-600",
  };
  return (
    <span className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-bold ${colors[color]}`}>
      <span className="material-symbols-outlined text-[13px]">{icon}</span>
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    متاح: "border-emerald-100 bg-emerald-50 text-emerald-700",
    محجوز: "border-amber-100 bg-amber-50 text-amber-700",
    "تم التسليم": "border-blue-100 bg-blue-50 text-blue-700",
    مخفي: "border-gray-200 bg-gray-50 text-gray-500",
  };
  return (
    <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-black ${map[status] ?? "border-gray-200 bg-gray-50 text-gray-500"}`}>
      {status}
    </span>
  );
}
