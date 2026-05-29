"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import axiosInstance from "@/lib/api/axiosInstance";

interface AdminItem {
  _id: string;
  title: string;
  category: string;
  status: string;
  images?: string[];
  donor?: { name: string; email: string };
  createdAt: string;
}

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

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get("/api/admin/items", { params: { page } });
      setItems(r.data.items);
      setPages(r.data.pages);
    } catch {
      showToast("تعذر تحميل الأغراض", false);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openDeleteModal = (item: AdminItem) => {
    setPendingDelete({
      id: item._id,
      title: item.title,
      donorName: item.donor?.name,
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
      await axiosInstance.delete(`/api/admin/items/${id}`, {
        data: { adminNote: deleteNote.trim() },
      });

      setItems((prev) => prev.filter((item) => item._id !== id));
      showToast("تم حذف الغرض ✅", true);
      setPendingDelete(null);
      setDeleteNote("");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.msg ?? "حدث خطأ أثناء حذف الغرض"
        : "حدث خطأ أثناء حذف الغرض";
      showToast(msg, false);
    } finally {
      setBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getImage = (item: AdminItem) => {
    const img = item.images?.[0];
    if (!img) return null;
    return img.startsWith("http") ? img : `${apiUrl}/${img}`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {toast && (
  <div
    className={`fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white transition-all ${
      toast.ok ? "bg-green-500" : "bg-red-500"
    }`}
  >
    {toast.msg}
  </div>
)}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-black text-gray-800">تأكيد حذف الغرض</h2>

            <p className="text-[13px] text-gray-500 leading-6">
              الغرض: <span className="font-bold text-gray-800">{pendingDelete.title}</span>
              {pendingDelete.donorName ? (
                <>
                  <br />
                  صاحب الغرض:{" "}
                  <span className="font-bold text-gray-800">{pendingDelete.donorName}</span>
                </>
              ) : null}
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500">
                تعليق الحذف <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={deleteNote}
                onChange={(e) => setDeleteNote(e.target.value)}
                placeholder="اكتب سبب حذف الغرض..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-black bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-xl font-black mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">inventory_2</span>
        الأغراض
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              <th className="text-right p-4">الغرض</th>
              <th className="text-right p-4">التصنيف</th>
              <th className="text-right p-4">المتبرع</th>
              <th className="text-right p-4">الحالة</th>
              <th className="text-right p-4">التاريخ</th>
              <th className="p-4" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="p-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  <span className="material-symbols-outlined text-4xl block mb-2">
                    inventory_2
                  </span>
                  لا توجد أغراض
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const imageUrl = getImage(item);

                return (
                  <tr
                    key={item._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.title}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-gray-300 text-lg">
                                image
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-[13px] line-clamp-1">
                          {item.title}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-500 text-[12px]">{item.category}</td>

                    <td className="p-4">
                      <div>
                        <p className="font-bold text-[12px]">{item.donor?.name ?? "—"}</p>
                        <p className="text-[11px] text-gray-400">
                          {item.donor?.email ?? ""}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                          item.status === "تم التسليم"
                            ? "bg-green-50 text-green-600"
                            : item.status === "محجوز"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-4 text-[11px] text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => openDeleteModal(item)}
                        disabled={busy[item._id]}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[11px] font-black hover:bg-red-100 disabled:opacity-50 transition-all"
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

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                page === p
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
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