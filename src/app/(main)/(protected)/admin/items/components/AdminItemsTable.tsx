import Image from "next/image";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import type { AdminItem } from "@/types/admin.types";

type AdminItemsTableProps = {
  items: AdminItem[];
  loading: boolean;
  busy: Record<string, boolean>;
  page: number;
  pages: number;
  getImage: (item: AdminItem) => string | null;
  onDelete: (item: AdminItem) => void;
};

export default function AdminItemsTable({
  items,
  loading,
  busy,
  page,
  pages,
  getImage,
  onDelete,
}: AdminItemsTableProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#e8e2d9] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between border-b border-[#f0ebe4] bg-[#faf8f4] px-5 py-4">
        <div>
          <h2 className="text-sm font-black text-[#233433]">قائمة الأغراض</h2>
          <p className="mt-1 text-xs text-[#8a837a]">
            جميع العناصر المنشورة ضمن صفحة إدارة الأدمن
          </p>
        </div>

        <div className="rounded-full border border-[#e9e3db] bg-white px-3 py-1 text-[11px] font-extrabold text-[#8e877f]">
          الصفحة {page} من {pages}
        </div>
      </div>

      <ResponsiveTable label="جدول أغراض المنصة">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-white">
            <tr className="border-b border-[#f0ebe4] text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a39b92]">
              <th className="p-4 text-right">الغرض</th>
              <th className="p-4 text-right">التصنيف</th>
              <th className="p-4 text-right">المتبرع</th>
              <th className="p-4 text-right">الحالة</th>
              <th className="p-4 text-right">التاريخ</th>
              <th className="p-4 text-right">إجراء</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-[#f5f1eb]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="p-4">
                      <div className="h-4 animate-pulse rounded-full bg-[#f1ece5]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-[#b3aba1]">
                    <span className="material-symbols-outlined mb-3 text-5xl">
                      inventory_2
                    </span>
                    <p className="text-base font-black text-[#7b756d]">
                      لا توجد أغراض
                    </p>
                    <p className="mt-1 text-sm text-[#a39b92]">
                      لا يوجد عناصر معروضة حاليًا في هذه الصفحة.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const imageUrl = getImage(item);

                return (
                  <tr
                    key={item._id}
                    className="border-b border-[#f5f1eb] transition-colors hover:bg-[#fcfaf7]"
                  >
                    {/* Item */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f2eee7]">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.title}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="material-symbols-outlined text-lg text-[#b8b0a7]">
                                image
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-black text-[#223433]">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-[#9b948c]">
                            {imageUrl ? "صورة متوفرة" : "بدون صورة"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="rounded-xl bg-[#f4f1eb] px-2.5 py-1 text-[11px] font-black text-[#746e67]">
                        {item.category}
                      </span>
                    </td>

                    {/* Donor */}
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-bold text-[#223433]">
                          {item.donor?.name ?? "—"}
                        </p>
                        <p className="text-xs text-[#9b948c]">
                          {item.donor?.email ?? ""}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`rounded-xl px-2.5 py-1 text-[11px] font-black ${
                          item.status === "تم التسليم"
                            ? "bg-green-50 text-green-600"
                            : item.status === "محجوز"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4">
                      <span className="text-xs font-medium text-[#8f877f]">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("ar-EG")
                          : "—"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4">
                      <button
                        onClick={() => onDelete(item)}
                        disabled={busy[item._id]}
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition-all duration-300 hover:bg-red-100 disabled:opacity-50"
                      >
                        {busy[item._id] ? "جاري الحذف..." : "حذف"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ResponsiveTable>
    </section>
  );
}
