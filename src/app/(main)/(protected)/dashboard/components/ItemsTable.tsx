"use client";
import Link from "next/link";
import Image from "next/image";

// ✅ حذف otp من الـ interface
interface Item {
  _id: string;
  title: string;
  imageUrl: string;
  status: string;
  isRated: boolean;
  // otp?: string; ← محذوف
  bookedBy?: { _id: string; name: string; phone: string };
}

interface ItemsTableProps {
  items: Item[];
  activeTab: "donations" | "requests";
  onDelete: (id: string, status: string) => void;
  onCancelBooking: (id: string) => void;
  onOpenOtp: (item: Item) => void;
}

export function ItemsTable({
  items,
  activeTab,
  onDelete,
  onCancelBooking,
  onOpenOtp,
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
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                📦
              </div>
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

            {/* حالة الغرض */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={item.status} />

              {/* ✅ بدل عرض OTP — رسالة إيميل */}
              {item.status === "محجوز" && activeTab === "requests" && (
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-xs border border-blue-100 flex items-center gap-1">
                  <span>📧</span>
                  <span>رمز التسليم أُرسل لبريدك</span>
                </div>
              )}

              {/* تقييم منتظر */}
              {item.status === "تم التسليم" && !item.isRated && (
                <span className="text-xs text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-lg">
                  ⭐ بانتظار تقييمك
                </span>
              )}
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* زر تأكيد التسليم — للمتبرع فقط */}
            {activeTab === "donations" && item.status === "محجوز" && (
              <button
                onClick={() => onOpenOtp(item)}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                تأكيد التسليم
              </button>
            )}

            {/* زر إلغاء الحجز — للمستلم */}
            {activeTab === "requests" && item.status === "محجوز" && (
              <button
                onClick={() => onCancelBooking(item._id)}
                className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-xl font-bold hover:bg-red-100 transition-colors"
              >
                إلغاء الحجز
              </button>
            )}

            {/* زر حذف */}
            {activeTab === "donations" && item.status === "متاح" && (
              <button
                onClick={() => onDelete(item._id, item.status)}
                className="text-xs bg-gray-50 text-gray-500 px-3 py-1.5 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                حذف
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── مكون مساعد للحالة ──────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    "متاح":       { label: "متاح",        className: "bg-green-50 text-green-600 border-green-100" },
    "محجوز":      { label: "محجوز",       className: "bg-yellow-50 text-yellow-600 border-yellow-100" },
    "تم التسليم": { label: "تم التسليم",  className: "bg-blue-50 text-blue-600 border-blue-100" },
    "مخفي":       { label: "مخفي",        className: "bg-gray-50 text-gray-500 border-gray-200" },
  };

  const config = map[status] ?? { label: status, className: "bg-gray-50 text-gray-500 border-gray-200" };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-lg border font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}