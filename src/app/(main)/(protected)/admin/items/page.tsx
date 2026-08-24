"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { deleteAdminItem, getAdminItems } from "@/lib/api/adminApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import type { AdminItem } from "@/types/admin.types";

type PendingDelete = {
  id: string;
  title: string;
  donorName?: string;
} | null;

export default function AdminItemsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deleteNote, setDeleteNote] = useState("");

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getAdminItems(page, signal);
      if (!signal?.aborted) {
        setItems(data.items);
        setPages(data.pages);
      }
    } catch {
      if (!signal?.aborted) showToast("تعذر تحميل الأغراض", false);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchItems(controller.signal);
    return () => controller.abort();
  }, [fetchItems]);

  const openDeleteModal = (item: AdminItem) => {
    setPendingDelete({
      id: item._id,
      title: item.title,
      donorName: item.donor?.name ?? undefined,
    });
    setDeleteNote("");
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    if (!deleteNote.trim()) {
      showToast("تعليق الحذف إجباري", false);
      return;
    }

    const id = pendingDelete.id;
    if (busy[id]) return;

    setBusy((prev) => ({ ...prev, [id]: true }));

    try {
      await deleteAdminItem(id, deleteNote.trim());

      setItems((prev) => prev.filter((item) => item._id !== id));
      showToast("تم حذف الغرض ✅", true);
      setPendingDelete(null);
      setDeleteNote("");
    } catch (err: unknown) {
      showToast(extractErrorMsg(err, "حدث خطأ أثناء حذف الغرض"), false);
    } finally {
      setBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getImage = (item: AdminItem) => {
    const img = item.imageUrl;
    if (!img) return null;
    return img.startsWith("http") ? img : `${apiUrl}/${img}`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-black text-white shadow-[0_20px_40px_rgba(15,23,42,0.16)] transition-all ${
            toast.ok ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-[30px] border border-white/30 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <span className="material-symbols-outlined text-[22px]">
                  delete
                </span>
              </div>

              <div>
                <h2 className="text-base font-black text-[#1f312f]">
                  تأكيد حذف الغرض
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#7c766f]">
                  الغرض:{" "}
                  <span className="font-black text-[#263735]">
                    {pendingDelete.title}
                  </span>
                </p>

                {pendingDelete.donorName ? (
                  <p className="text-sm leading-6 text-[#7c766f]">
                    صاحب الغرض:{" "}
                    <span className="font-bold text-[#263735]">
                      {pendingDelete.donorName}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-[#8a837b]">
                تعليق الحذف <span className="text-red-500">*</span>
              </label>

              <textarea
                rows={4}
                value={deleteNote}
                onChange={(e) => setDeleteNote(e.target.value)}
                placeholder="اكتب سبب حذف الغرض..."
                className="w-full rounded-2xl border border-[#e7e1d8] bg-[#fcfaf7] px-4 py-3 text-sm text-[#24302f] outline-none transition-all duration-300 placeholder:text-[#b3aba1] focus:border-primary resize-none"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-black text-white transition-all duration-300 hover:bg-red-700"
              >
                تأكيد الحذف
              </button>

              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 rounded-2xl bg-[#f3f0ea] py-3 text-sm font-black text-[#5f5a54] transition-all duration-300 hover:bg-[#eae5dd]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="rounded-[30px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-extrabold text-primary">
              <span className="material-symbols-outlined text-[15px]">
                inventory_2
              </span>
              إدارة الأغراض
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#1f312f]">
              الأغراض
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7a746d]">
              مراجعة العناصر المنشورة، التحقق من أصحابها، ومتابعة حالتها من واجهة
              مرتبة ومناسبة للإدارة اليومية.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { icon: "inventory", label: "إدارة مباشرة" },
              { icon: "image", label: "معاينة أوضح" },
              { icon: "schedule", label: "متابعة زمنية" },
            ].map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#ece6de] bg-white px-3.5 py-2 text-xs font-bold text-[#5f5a54] shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {item.icon}
                </span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Table Shell */}
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

        <div className="overflow-x-auto">
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
                          onClick={() => openDeleteModal(item)}
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
        </div>
      </section>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-10 min-w-10 rounded-2xl px-3 text-sm font-black transition-all ${
                page === p
                  ? "bg-primary text-white shadow-[0_10px_20px_rgba(1,105,111,0.18)]"
                  : "border border-[#e5dfd6] bg-white text-[#746e67] hover:bg-[#faf8f4]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
