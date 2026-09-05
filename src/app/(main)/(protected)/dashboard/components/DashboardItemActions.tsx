"use client";

import { DeliveryConfirmFlow } from "./DeliveryConfirmFlow";
import { hasBookedBy, type DashboardItemCardProps } from "./dashboardItem.types";

export function DashboardItemActions(props: DashboardItemCardProps) {
  const { item, activeTab, deliveryLoadingItemId, deliveryState } = props;
  const showChat =
    Boolean(props.onOpenChat) &&
    item.status === "محجوز" &&
    (activeTab === "requests" || hasBookedBy(item.bookedBy));

  return (
    <div className="flex shrink-0 flex-wrap gap-2 md:w-auto md:flex-col">
      {showChat && props.onOpenChat && (
        <ActionButton icon="chat" onClick={() => props.onOpenChat?.(item)} tone="primary">
          {activeTab === "requests" ? "تواصل مع المتبرع" : "تواصل مع الحاجز"}
        </ActionButton>
      )}

      {activeTab === "requests" && item.status === "محجوز" && (
        <DeliveryConfirmFlow item={item} role="recipient" loading={deliveryLoadingItemId === item._id} disabled={deliveryLoadingItemId !== null} onConfirm={props.onRecipientConfirm} />
      )}

      {activeTab === "donations" && item.status === "محجوز" && (
        <DeliveryConfirmFlow
          item={item}
          role="donor"
          loading={deliveryLoadingItemId === item._id}
          disabled={deliveryLoadingItemId !== null}
          onConfirm={props.onDonorConfirm}
          waitingDonor={item.recipientConfirmed === true || (deliveryState.itemId === item._id && deliveryState.waitingForDonor)}
        />
      )}

      {activeTab === "donations" && item.status === "محجوز" && !item.recipientConfirmed && (
        <ActionButton icon="lock_open" onClick={() => props.onDonorCancelBooking(item._id)} tone="orange">فك الحجز</ActionButton>
      )}

      {activeTab === "donations" && ["متاح", "مخفي"].includes(item.status) && (
        <ActionButton icon="edit" onClick={() => props.onEdit(item._id)} tone="blue">تعديل</ActionButton>
      )}

      {activeTab === "donations" && item.status !== "تم التسليم" && !item.recipientConfirmed && (
        <ActionButton icon="delete" onClick={() => props.onDelete(item._id, item.status)} tone="gray">حذف</ActionButton>
      )}

      {activeTab === "requests" && item.status === "محجوز" && !item.recipientConfirmed && (
        <ActionButton icon="close" onClick={() => props.onCancelBooking(item._id)} tone="red">إلغاء الحجز</ActionButton>
      )}

      {activeTab === "requests" && item.status === "تم التسليم" && props.onReport && (
        <ActionButton icon="flag" onClick={() => props.onReport?.(item, "donor")} tone="red">إبلاغ</ActionButton>
      )}

      {activeTab === "donations" && item.status === "تم التسليم" && props.onReport && (
        <ActionButton icon="flag" onClick={() => props.onReport?.(item, "receiver")} tone="red">إبلاغ</ActionButton>
      )}

      {typeof item.reportId === "string" && props.onAppeal && (
        <ActionButton icon="gavel" onClick={() => props.onAppeal?.(item.reportId!)} tone="yellow">اعتراض</ActionButton>
      )}
    </div>
  );
}

const TONES = {
  primary: "bg-primary/[0.07] text-primary hover:bg-primary/[0.13]",
  orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
  blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  gray: "bg-gray-50 text-gray-600 hover:bg-gray-100",
  red: "bg-red-50 text-red-600 hover:bg-red-100",
  yellow: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
} as const;

function ActionButton({ icon, tone, onClick, children }: { icon: string; tone: keyof typeof TONES; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-[12px] font-bold transition-all duration-150 active:scale-[0.98] ${TONES[tone]}`}>
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {children}
    </button>
  );
}
