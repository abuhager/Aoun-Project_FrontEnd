// src/app/(main)/(protected)/dashboard/components/ItemsTable.tsx  ✅ REDESIGNED
"use client";

import Link   from "next/link";
import Image  from "next/image";
import type { Item } from "../hooks/useDashboard";
import { DeliveryConfirmFlow } from "./DeliveryConfirmFlow";

type DashboardItem = Item & { reportId?: string | null };

interface DeliveryState {
  itemId: string | null;
  waitingForDonor: boolean;
}

interface ItemsTableProps {
  items: DashboardItem[];
  activeTab: "donations" | "requests";
  onDelete: (id: string, status: string) => void;
  onCancelBooking: (id: string) => void;
  onDonorCancelBooking: (id: string) => void;
  onEdit: (id: string) => void;
  deliveryState: DeliveryState;
  deliveryLoading: boolean;
  onRecipientConfirm: (itemId: string) => void;
  onDonorConfirm: (itemId: string) => void;
  onOpenChat?: (item: DashboardItem) => void;
  onReport?: (item: DashboardItem, target: "donor" | "receiver") => void;
  onAppeal?: (reportId: string) => void;
}

function getBookedByName(bookedBy: DashboardItem["bookedBy"]): string {
  if (!bookedBy) return "";
  if (typeof bookedBy === "string") return bookedBy;
  return bookedBy.name ?? "";
}

/* ── Empty State ─────────────────────────────────────────────── */
function EmptyState({ activeTab }: { activeTab: "donations" | "requests" }) {
  const isDonations = activeTab === "donations";
  return (
    <div
      className="flex flex-col items-center justify-center
                 rounded-2xl border border-dashed border-gray-200
                 bg-white py-14 px-6 text-center"
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center
                   rounded-2xl bg-gray-50"
      >
        <span
          className="material-symbols-outlined text-[30px] text-gray-300"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          {isDonations ? "volunteer_activism" : "inventory_2"}
        </span>
      </div>
      <p className="text-[15px] font-black text-gray-700">
        {isDonations ? "لم تتبرع بأي غرض بعد" : "لم تحجز أي غرض بعد"}
      </p>
      <p className="mt-1.5 max-w-[28ch] text-[13px] text-gray-400">
        {isDonations
          ? "شارك الخير وأضف غرضاً للتبرع الآن"
          : "تصفح الأغراض المتاحة واحجز ما تحتاجه"}
      </p>
      <Link
        href={isDonations ? "/add-item" : "/browse"}
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl
                   bg-primary px-5 py-2.5 text-[13px] font-black text-white
                   shadow-md shadow-primary/20 transition-all duration-200
                   hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25
                   active:scale-95"
      >
        <span
          className="material-symbols-outlined text-[16px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isDonations ? "add_circle" : "explore"}
        </span>
        {isDonations ? "تبرع الآن" : "تصفح الأغراض"}
      </Link>
    </div>
  );
}

/* ── Items Table ─────────────────────────────────────────────── */
export function ItemsTable({
  items,
  activeTab,
  onDelete,
  onCancelBooking,
  onDonorCancelBooking,
  onEdit,
  deliveryState,
  deliveryLoading,
  onRecipientConfirm,
  onDonorConfirm,
  onOpenChat,
  onReport,
  onAppeal,
}: ItemsTableProps) {
  if (items.length === 0) return <EmptyState activeTab={activeTab} />;

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const reportId = item.reportId;

        return (
          <div
            key={item._id}
            className="flex items-start gap-3.5 rounded-2xl border
                       border-black/[0.06] bg-white p-4 shadow-sm
                       transition-all duration-200 hover:shadow-md
                       hover:shadow-black/[0.05] md:items-center"
            dir="rtl"
          >
            {/* صورة الغرض */}
            <div
              className="relative h-16 w-16 shrink-0 overflow-hidden
                         rounded-xl border border-black/[0.06] bg-gray-50"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span
                    className="material-symbols-outlined text-[28px] text-gray-300"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    inventory_2
                  </span>
                </div>
              )}
            </div>

            {/* محتوى البطاقة */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/items/${item._id}`}
                className="block truncate text-[15px] font-black text-gray-900
                           transition-colors duration-150 hover:text-primary"
              >
                {item.title}
              </Link>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatusBadge status={item.status} />

                {item.status === "محجوز" && activeTab === "requests" && (
                  item.recipientConfirmed ? (
                    <span
                      className="flex items-center gap-1 rounded-lg border
                                 border-amber-100 bg-amber-50 px-2 py-0.5
                                 text-[11px] font-bold text-amber-600"
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        schedule
                      </span>
                      في انتظار تأكيد المتبرع
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1 rounded-lg border
                                 border-blue-100 bg-blue-50 px-2 py-0.5
                                 text-[11px] font-bold text-blue-600"
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        touch_app
                      </span>
                      بانتظار تأكيد استلامك
                    </span>
                  )
                )}

                {item.status === "تم التسليم" && !item.isRated && (
                  <span
                    className="rounded-lg border border-orange-100 bg-orange-50
                               px-2 py-0.5 text-[11px] font-bold text-orange-500"
                  >
                    ⭐ بانتظار تقييمك
                  </span>
                )}

                {activeTab === "donations" &&
                  item.status === "محجوز" &&
                  item.bookedBy && (
                    <span
                      className="rounded-lg border border-gray-100 bg-gray-50
                                 px-2 py-0.5 text-[11px] font-bold text-gray-500"
                    >
                      بواسطة: {getBookedByName(item.bookedBy)}
                    </span>
                  )}

                {reportId && (
                  <span
                    className="flex items-center gap-1 rounded-lg border
                               border-red-100 bg-red-50 px-2 py-0.5
                               text-[11px] font-bold text-red-500"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      warning
                    </span>
                    بلاغ معلّق
                  </span>
                )}
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex shrink-0 flex-col gap-1.5">

              {item.status === "محجوز" && onOpenChat && (
                <button
                  onClick={() => onOpenChat(item)}
                  className="flex items-center gap-1 rounded-xl bg-primary/[0.07]
                             px-3 py-1.5 text-[12px] font-bold text-primary
                             transition-all duration-150 hover:bg-primary/[0.13]
                             active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    chat
                  </span>
                  محادثة
                </button>
              )}

              {activeTab === "requests" && item.status === "محجوز" && (
                <DeliveryConfirmFlow
                  item={item}
                  role="recipient"
                  loading={deliveryLoading && deliveryState.itemId === item._id}
                  onConfirm={onRecipientConfirm}
                />
              )}

              {activeTab === "donations" && item.status === "محجوز" && (
                <DeliveryConfirmFlow
                  item={item}
                  role="donor"
                  loading={deliveryLoading && deliveryState.itemId === item._id}
                  onConfirm={onDonorConfirm}
                  waitingDonor={
                    item.recipientConfirmed === true ||
                    (deliveryState.itemId === item._id &&
                      deliveryState.waitingForDonor)
                  }
                />
              )}

              {activeTab === "donations" && item.status === "محجوز" && (
                <button
                  onClick={() => onDonorCancelBooking(item._id)}
                  className="flex items-center gap-1 rounded-xl bg-orange-50
                             px-3 py-1.5 text-[12px] font-bold text-orange-500
                             transition-all duration-150 hover:bg-orange-100
                             active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    lock_open
                  </span>
                  فك الحجز
                </button>
              )}

              {activeTab === "donations" &&
                ["متاح", "مخفي"].includes(item.status) && (
                  <button
                    onClick={() => onEdit(item._id)}
                    className="flex items-center gap-1 rounded-xl bg-blue-50
                               px-3 py-1.5 text-[12px] font-bold text-blue-500
                               transition-all duration-150 hover:bg-blue-100
                               active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      edit
                    </span>
                    تعديل
                  </button>
                )}

              {activeTab === "donations" && item.status !== "تم التسليم" && (
                <button
                  onClick={() => onDelete(item._id, item.status)}
                  className="flex items-center gap-1 rounded-xl bg-gray-50
                             px-3 py-1.5 text-[12px] font-bold text-gray-500
                             transition-all duration-150 hover:bg-gray-100
                             active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    delete
                  </span>
                  حذف
                </button>
              )}

              {activeTab === "requests" && item.status === "محجوز" && (
                <button
                  onClick={() => onCancelBooking(item._id)}
                  className="flex items-center gap-1 rounded-xl bg-red-50
                             px-3 py-1.5 text-[12px] font-bold text-red-500
                             transition-all duration-150 hover:bg-red-100
                             active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    close
                  </span>
                  إلغاء الحجز
                </button>
              )}

              {activeTab === "requests" &&
                item.status === "تم التسليم" &&
                onReport && (
                  <button
                    onClick={() => onReport(item, "donor")}
                    className="flex items-center gap-1 rounded-xl bg-red-50
                               px-3 py-1.5 text-[12px] font-bold text-red-400
                               transition-all duration-150 hover:bg-red-100
                               hover:text-red-600 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      flag
                    </span>
                    إبلاغ
                  </button>
                )}

              {activeTab === "donations" &&
                item.status === "تم التسليم" &&
                onReport && (
                  <button
                    onClick={() => onReport(item, "receiver")}
                    className="flex items-center gap-1 rounded-xl bg-red-50
                               px-3 py-1.5 text-[12px] font-bold text-red-400
                               transition-all duration-150 hover:bg-red-100
                               hover:text-red-600 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      flag
                    </span>
                    إبلاغ
                  </button>
                )}

              {typeof reportId === "string" && onAppeal && (
                <button
                  onClick={() => onAppeal(reportId)}
                  className="flex items-center gap-1 rounded-xl bg-yellow-50
                             px-3 py-1.5 text-[12px] font-bold text-yellow-600
                             transition-all duration-150 hover:bg-yellow-100
                             active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    gavel
                  </span>
                  اعتراض
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Status Badge ────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "متاح":        "border-emerald-100 bg-emerald-50   text-emerald-700",
    "محجوز":       "border-amber-100   bg-amber-50     text-amber-700",
    "تم التسليم":  "border-blue-100    bg-blue-50      text-blue-700",
    "مخفي":        "border-gray-200    bg-gray-50      text-gray-500",
  };

  return (
    <span
      className={`rounded-lg border px-2 py-0.5 text-[11px] font-black
                  ${map[status] ?? "border-gray-200 bg-gray-50 text-gray-500"}`}
    >
      {status}
    </span>
  );
}