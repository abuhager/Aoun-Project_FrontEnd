"use client";

import Link from "next/link";
import Image from "next/image";
import type { Item } from "../hooks/useDashboard";
import { DeliveryConfirmFlow } from "./DeliveryConfirmFlow";
import type { BookedByUser } from "@/types/user.types";

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

function hasBookedBy(bookedBy: BookedByUser | string | null | undefined): boolean {
  if (!bookedBy) return false;
  if (typeof bookedBy === "string") return bookedBy.length > 0;
  return !!bookedBy._id;
}

/* ── Empty State ─────────────────────────────────────────────── */
function EmptyState({ activeTab }: { activeTab: "donations" | "requests" }) {
  const isDonations = activeTab === "donations";

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#fcfbf8] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
        <span
          className="material-symbols-outlined text-[28px] text-gray-300"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          {isDonations ? "volunteer_activism" : "inventory_2"}
        </span>
      </div>

      <p className="text-[15px] font-black text-gray-800">
        {isDonations ? "لم تضف أي تبرع بعد" : "لا توجد طلبات حالياً"}
      </p>

      <p className="mt-1.5 max-w-[30ch] text-[13px] leading-6 text-gray-500">
        {isDonations
          ? "ابدأ بإضافة غرض جديد ليظهر هنا وتتمكن من إدارة حالته بسهولة."
          : "تصفح العناصر المتاحة، وعند حجز أي غرض سيظهر هنا مباشرة."}
      </p>

      <Link
        href={isDonations ? "/add-item" : "/browse"}
        className="mt-5 inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-[13px] font-black text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
      >
        <span
          className="material-symbols-outlined text-[16px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isDonations ? "add_circle" : "explore"}
        </span>
        {isDonations ? "أضف تبرعاً" : "تصفح الأغراض"}
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

        const showChat =
          onOpenChat &&
          item.status === "محجوز" &&
          (activeTab === "requests" ||
            (activeTab === "donations" && hasBookedBy(item.bookedBy)));

        return (
          <div
            key={item._id}
            className="group rounded-3xl border border-black/[0.06] bg-white p-4 shadow-sm transition-all duration-200 hover:border-black/[0.08] hover:shadow-md"
            dir="rtl"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Image */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-gray-50">
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
                      className="material-symbols-outlined text-[26px] text-gray-300"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      inventory_2
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/items/${item._id}`}
                      className="block truncate text-[15px] font-black text-gray-900 transition-colors duration-150 hover:text-primary"
                    >
                      {item.title}
                    </Link>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={item.status} />

                      {item.status === "محجوز" && activeTab === "requests" &&
                        (item.recipientConfirmed ? (
                          <span className="flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            <span className="material-symbols-outlined text-[13px]">
                              schedule
                            </span>
                            بانتظار تأكيد المتبرع
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                            <span className="material-symbols-outlined text-[13px]">
                              touch_app
                            </span>
                            بانتظار تأكيدك للاستلام
                          </span>
                        ))}

                      {item.status === "تم التسليم" && !item.isRated && (
                        <span className="rounded-lg border border-orange-100 bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600">
                          ⭐ بانتظار تقييمك
                        </span>
                      )}

                      {activeTab === "donations" &&
                        item.status === "محجوز" &&
                        item.bookedBy && (
                          <span className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-600">
                            بواسطة: {getBookedByName(item.bookedBy)}
                          </span>
                        )}

                      {reportId && (
                        <span className="flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                          <span className="material-symbols-outlined text-[13px]">
                            warning
                          </span>
                          بلاغ معلّق
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-gray-400">
                    {activeTab === "donations" ? "عنصر متبرع به" : "عنصر محجوز"}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap gap-2 md:w-auto md:flex-col">

                {/* 🌟 [FIX-CHAT-SUCCESS] تمرير كائن الـ item بالكامل لصفحة الداشبورد لتستخلص المعرّفات ذكياً */}
                {showChat && (
                  <button
                    onClick={() => onOpenChat!(item)} 
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary/[0.07] px-3 py-2 text-[12px] font-bold text-primary transition-all duration-150 hover:bg-primary/[0.13] active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      chat
                    </span>
                    {activeTab === "requests" ? "تواصل مع المتبرع" : "تواصل مع الحاجز"}
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

                {activeTab === "donations" &&
                  item.status === "محجوز" &&
                  !item.recipientConfirmed && (
                  <button
                    onClick={() => onDonorCancelBooking(item._id)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-orange-50 px-3 py-2 text-[12px] font-bold text-orange-600 transition-all duration-150 hover:bg-orange-100 active:scale-[0.98]"
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
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-[12px] font-bold text-blue-600 transition-all duration-150 hover:bg-blue-100 active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        edit
                      </span>
                      تعديل
                    </button>
                  )}

                {activeTab === "donations" &&
                  item.status !== "تم التسليم" &&
                  !item.recipientConfirmed && (
                  <button
                    onClick={() => onDelete(item._id, item.status)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-2 text-[12px] font-bold text-gray-600 transition-all duration-150 hover:bg-gray-100 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      delete
                    </span>
                    حذف
                  </button>
                )}

                {activeTab === "requests" &&
                  item.status === "محجوز" &&
                  !item.recipientConfirmed && (
                  <button
                    onClick={() => onCancelBooking(item._id)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-[12px] font-bold text-red-600 transition-all duration-150 hover:bg-red-100 active:scale-[0.98]"
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
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-[12px] font-bold text-red-500 transition-all duration-150 hover:bg-red-100 hover:text-red-600 active:scale-[0.98]"
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
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-[12px] font-bold text-red-500 transition-all duration-150 hover:bg-red-100 hover:text-red-600 active:scale-[0.98]"
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
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-yellow-50 px-3 py-2 text-[12px] font-bold text-yellow-700 transition-all duration-150 hover:bg-yellow-100 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      gavel
                    </span>
                    اعتراض
                  </button>
                )}
              </div>
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
    متاح: "border-emerald-100 bg-emerald-50 text-emerald-700",
    محجوز: "border-amber-100 bg-amber-50 text-amber-700",
    "تم التسليم": "border-blue-100 bg-blue-50 text-blue-700",
    مخفي: "border-gray-200 bg-gray-50 text-gray-500",
  };

  return (
    <span
      className={`rounded-lg border px-2 py-0.5 text-[11px] font-black ${
        map[status] ?? "border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}
