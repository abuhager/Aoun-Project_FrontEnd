"use client";
import Link from "next/link";
import Image from "next/image";

interface Item {
  _id: string;
  title: string;
  imageUrl: string;
  status: string;
  isRated: boolean;
  otp?: string;
}

interface ItemsTableProps {
  items: Item[];
  activeTab: "donations" | "requests";
  onDelete: (id: string, status: string) => void;
  onCancelBooking: (id: string) => void;
  onOpenOtp: (item: Item) => void;
}

export function ItemsTable({
  items, activeTab, onDelete, onCancelBooking, onOpenOtp,
}: ItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#edeeef] p-16 text-center">
        <span className="material-symbols-outlined text-5xl text-gray-200 mb-4 block">inbox</span>
        <p className="text-sm font-bold text-gray-400">
          {activeTab === "donations" ? "لم تضف أي تبرعات بعد" : "لم تطلب أي أغراض بعد"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#edeeef] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-bold text-xs">
              <th className="p-4">الغرض</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">

                {/* ─── اسم الغرض + صورة ─── */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-gray-100 shrink-0">
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    </div>
                    <span className="font-bold line-clamp-1">{item.title}</span>
                  </div>
                </td>

                {/* ─── الحالة ─── */}
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap ${
                    item.status === "محجوز"       ? "bg-blue-50 text-blue-600"       :
                    item.status === "تم التسليم" ? "bg-emerald-50 text-emerald-600" :
                    "bg-gray-50 text-gray-500"
                  }`}>
                    {item.status}
                  </span>
                </td>

                {/* ─── الإجراءات ─── */}
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Link href={`/items/${item._id}`} className="text-primary hover:bg-primary/5 p-2 rounded-xl" title="عرض">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </Link>

                    {/* أزرار تبرعاتي */}
                    {activeTab === "donations" && item.status !== "تم التسليم" && (
                      <>
                        {item.status === "محجوز" && (
                          <button
                            onClick={() => onOpenOtp(item)}
                            className="bg-primary text-white px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-primary/90 transition-all"
                          >
                            تأكيد التسليم
                          </button>
                        )}
                        {item.status === "محجوز" && (
                          <button
                            onClick={() => onCancelBooking(item._id)}
                            className="text-orange-500 hover:bg-orange-50 p-2 rounded-xl transition-all"
                            title="إلغاء حجز المستلم"
                          >
                            <span className="material-symbols-outlined text-lg">person_remove</span>
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(item._id, item.status)}
                          className="text-red-400 hover:bg-red-50 p-2 rounded-xl transition-all"
                          title="حذف"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </>
                    )}

                    {/* أزرار طلباتي */}
                    {activeTab === "requests" && (
                      <>
                        {item.status === "محجوز" && item.otp && (
                          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-mono font-black text-xs tracking-widest border border-blue-100">
                            {item.otp} 🔐
                          </div>
                        )}
                        {item.status === "تم التسليم" && !item.isRated && (
                          <Link
                            href={`/items/${item._id}`}
                            className="bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-yellow-100 hover:bg-yellow-100 transition-all"
                          >
                            قيّم ⭐
                          </Link>
                        )}
                        {item.status === "تم التسليم" && item.isRated && (
                          <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-emerald-100">
                            تم التقييم ✅
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}