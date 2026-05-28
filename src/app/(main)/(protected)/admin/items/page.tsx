// src/app/(main)/(protected)/admin/items/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

export default function AdminItemsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  const [items,   setItems]   = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get("/api/admin/items", { params: { page } });
      setItems(r.data.items);
      setPages(r.data.pages);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا الغرض؟")) return;
    await axiosInstance.delete(`/api/admin/items/${id}`);
    fetchItems();
  };

  const getImage = (item: AdminItem) => {
    const img = item.images?.[0];
    if (!img) return null;
    return img.startsWith("http") ? img : `${apiUrl}/${img}`;
  };

  return (
    <div>
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
                  <span className="material-symbols-outlined text-4xl block mb-2">inventory_2</span>
                  لا توجد أغراض
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {getImage(item) ? (
                        <Image src={getImage(item)!} alt={item.title} width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-300 text-lg">image</span>
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-[13px] line-clamp-1">{item.title}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-500 text-[12px]">{item.category}</td>
                <td className="p-4">
                  <div>
                    <p className="font-bold text-[12px]">{item.donor?.name ?? "—"}</p>
                    <p className="text-[11px] text-gray-400">{item.donor?.email ?? ""}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                    item.status === "تم التسليم"
                      ? "bg-green-50 text-green-600"
                      : item.status === "محجوز"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-yellow-50 text-yellow-600"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-[11px] text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[11px] font-black hover:bg-red-100 transition-all"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold ${
                page === p ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-500"
              }`}
            >{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}