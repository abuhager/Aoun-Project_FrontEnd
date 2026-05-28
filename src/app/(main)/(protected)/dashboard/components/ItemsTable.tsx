"use client";
import Link  from "next/link";
import Image from "next/image";
import type { Item } from "../hooks/useDashboard";

// ✅ نوع DashboardItem مستعار من Item
type DashboardItem = Item;

interface ItemsTableProps {
  items:                DashboardItem[];
  activeTab:            "donations" | "requests";
  onDelete:             (id: string, status: string) => void;
  onCancelBooking:      (id: string) => void;
  onDonorCancelBooking: (id: string) => void;
  onEdit:               (id: string) => void;
  onOpenOtp:            (item: DashboardItem) => void;
  onReport?:            (item: DashboardItem, target: 'donor' | 'receiver') => void;
  onAppeal?:            (reportId: string) => void;  // ✅ إضافة
}

function getBookedByName(bookedBy: DashboardItem['bookedBy']): string {
  if (!bookedBy) return '';
  if (typeof bookedBy === 'string') return bookedBy;
  return bookedBy.name ?? '';
}

export function ItemsTable({
  items,
  activeTab,
  onDelete,
  onCancelBooking,
  onDonorCancelBooking,
  onEdit,
  onOpenOtp,
  onReport,
  onAppeal,  // ✅ إضافة
}: ItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="font-semibold">
          {activeTab === "donations" ? "لم تتبرع بأي غرض بعد" : "لم تحجز أي غرض بعد"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item._id}
          className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          dir="rtl"
        >
          {/* صورة الغرض */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.title} fill sizes="64px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
            )}
          </div>

          {/* معلومات الغرض */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/items/${item._id}`}
              className="font-bold text-gray-800 truncate block hover:text-primary transition-colors"
            >
              {item.title}
            </Link>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={item.status} />

              {item.status === "محجوز" && activeTab === "requests" && (
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-xs border border-blue-100 flex items-center gap-1">
                  <span>📧</span>
                  <span>رمز التسليم أُرسل لبريدك</span>
                </div>
              )}

              {item.status === "تم التسليم" && !item.isRated && (
                <span className="text-xs text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-lg">
                  ⭐ بانتظار تقييمك
                </span>
              )}

              {activeTab === "donations" && item.status === "محجوز" && item.bookedBy && (
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg">
                  محجوز بواسطة: {getBookedByName(item.bookedBy)}
                </span>
              )}
            </div>
          </div>

          {/* ── أزرار الإجراءات ── */}
          <div className="flex flex-col gap-2 flex-shrink-0">

            {activeTab === "donations" && item.status === "محجوز" && (
              <button
                onClick={() => onOpenOtp(item)}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                ✅ تأكيد التسليم
              </button>
            )}

            {activeTab === "donations" && item.status === "محجوز" && (
              <button
                onClick={() => onDonorCancelBooking(item._id)}
                className="text-xs bg-orange-50 text-orange-500 px-3 py-1.5 rounded-xl font-bold hover:bg-orange-100 transition-colors"
              >
                🔓 فك الحجز
              </button>
            )}

            {activeTab === "donations" && ["متاح", "مخفي"].includes(item.status) && (
              <button
                onClick={() => onEdit(item._id)}
                className="text-xs bg-blue-50 text-blue-500 px-3 py-1.5 rounded-xl font-bold hover:bg-blue-100 transition-colors"
              >
                ✏️ تعديل
              </button>
            )}

            {activeTab === "donations" && item.status !== "تم التسليم" && (
              <button
                onClick={() => onDelete(item._id, item.status)}
                className="text-xs bg-gray-50 text-gray-500 px-3 py-1.5 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                🗑️ حذف
              </button>
            )}

            {activeTab === "requests" && item.status === "محجوز" && (
              <button
                onClick={() => onCancelBooking(item._id)}
                className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-xl font-bold hover:bg-red-100 transition-colors"
              >
                ❌ إلغاء الحجز
              </button>
            )}

            {/* المستلم يبلّغ على المتبرع */}
            {activeTab === "requests" && item.status === "تم التسليم" && onReport && (
              <button
                onClick={() => onReport(item, 'donor')}
                className="text-xs bg-red-50 text-red-400 px-3 py-1.5 rounded-xl font-bold hover:bg-red-100 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">flag</span>
                إبلاغ عن المتبرع
              </button>
            )}

            {/* المتبرع يبلّغ على المستلم */}
            {activeTab === "donations" && item.status === "تم التسليم" && onReport && (
              <button
                onClick={() => onReport(item, 'receiver')}
                className="text-xs bg-red-50 text-red-400 px-3 py-1.5 rounded-xl font-bold hover:bg-red-100 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">flag</span>
                إبلاغ عن المستلم
              </button>
            )}

            {/* ✅ المتبرع يعترض على بلاغ — يحتاج reportId من الـ item */}
            {activeTab === "donations" && item.reportId && onAppeal && (
              <button
                onClick={() => onAppeal(item.reportId!)}
                className="text-xs bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-xl font-bold hover:bg-yellow-100 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">gavel</span>
                اعتراض
              </button>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    "متاح":       { label: "متاح",       className: "bg-green-50 text-green-600 border-green-100" },
    "محجوز":      { label: "محجوز",      className: "bg-yellow-50 text-yellow-600 border-yellow-100" },
    "تم التسليم": { label: "تم التسليم", className: "bg-blue-50 text-blue-600 border-blue-100" },
    "مخفي":       { label: "مخفي",       className: "bg-gray-50 text-gray-500 border-gray-200" },
  };
  const config = map[status] ?? { label: status, className: "bg-gray-50 text-gray-500 border-gray-200" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-lg border font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}