"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useEditItem } from "./hooks/useEditItem";

const CATEGORIES = ["كتب", "إلكترونيات", "أدوات", "قرطاسية", "أخرى"] as const;
const CONDITIONS = ["جديد", "مستعمل ممتاز", "مستعمل جيد"] as const;

export default function EditItemPage() {
  const {
    formData, preview, loading, updating, error,
    handleChange, handleImageChange, handleSubmit,
  } = useEditItem();

  // ─── شاشة التحميل ───
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-surface min-h-screen pb-20 text-[#191c1d] font-body" dir="rtl">

      <main className="pt-24 px-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-[#edeeef]">

          <h1 className="text-2xl md:text-3xl font-black text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">edit_document</span>
            تعديل تبرعك
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ─── الصورة ─── */}
            <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
              {preview && (
                <div className="relative w-40 h-40 overflow-hidden rounded-xl shadow-md">
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <label className="bg-primary text-white px-6 py-2 rounded-full text-xs font-bold cursor-pointer hover:bg-primary/90 transition-all">
                تغيير الصورة
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {/* ─── اسم الغرض ─── */}
            <div className="space-y-1">
              <label className="text-xs font-bold mr-2 text-gray-500">اسم الغرض</label>
              <input
                required name="title"
                value={formData.title} onChange={handleChange}
                className="w-full bg-surface-container-low p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
              />
            </div>

            {/* ─── الوصف ─── */}
            <div className="space-y-1">
              <label className="text-xs font-bold mr-2 text-gray-500">الوصف</label>
              <textarea
                required name="description" rows={4}
                value={formData.description} onChange={handleChange}
                className="w-full bg-surface-container-low p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* ─── القسم + الحالة ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold mr-2 text-gray-500">القسم</label>
                <select
                  name="category"
                  value={formData.category} onChange={handleChange}
                  className="w-full bg-surface-container-low p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold mr-2 text-gray-500">الحالة</label>
                <select
                  name="condition"
                  value={formData.condition} onChange={handleChange}
                  className="w-full bg-surface-container-low p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {updating ? "جاري الحفظ..." : "حفظ التعديلات 🎉"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}