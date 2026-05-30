"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useBrowse } from "./hooks/useBrowse";
import { useSettings } from "@/hooks/useSettings";

const CITIES = ["عمان", "إربد", "الزرقاء", "العقبة"] as const;

export default function BrowsePage() {
  const {
    filteredItems,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
  } = useBrowse();

  const { categories, isLoading: settingsLoading } = useSettings();

  return (
    <div className="bg-surface min-h-screen text-[#191c1d]" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-12 py-10 pt-28">
        <section className="mb-16">
          <div className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-[#edeeef]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">
                  search
                </span>
                <input
                  type="text"
                  placeholder="ابحث عن غرض..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-white border-none rounded-md outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                />
              </div>

              <div className="md:col-span-3 relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">
                  location_on
                </span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-white border-none rounded-md appearance-none outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
                >
                  <option value="">كل المدن</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">
                  category
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={settingsLoading || categories.length === 0}
                  className="w-full pr-12 pl-4 py-4 bg-white border-none rounded-md appearance-none outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {settingsLoading ? "جاري تحميل التصنيفات..." : "كل التصنيفات"}
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!settingsLoading && categories.length === 0 && (
              <p className="mt-3 text-xs text-red-600 font-medium">
                لا توجد تصنيفات متاحة حالياً من لوحة الإدارة.
              </p>
            )}
          </div>
        </section>

        <section className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#191c1d] mb-2 font-headline">
              تصفح التبرعات المتاحة
            </h1>
            <p className="text-on-surface-variant">
              اكتشف الأدوات التعليمية والأساسيات التي يحتاجها زملائك الطلاب
            </p>
          </div>

          <span className="bg-[#98f994]/30 text-[#0c7521] px-4 py-2 rounded-full text-sm font-bold border border-primary">
            {filteredItems.length} تبرع متاح حالياً
          </span>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredItems.map((item, index) => (
              <div
                key={item._id}
                className="bg-white rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl border border-[#edeeef]"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={item.imageUrl || item.image || "/placeholder.png"}
                    alt={item.title || item.name || "صورة الغرض"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                    priority={index === 0}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-md">
                      {item.condition || "مستعمل ممتاز"}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#191c1d] mb-3 font-headline truncate">
                    {item.title || item.name}
                  </h3>

                  <div className="flex items-center text-on-surface-variant text-sm mb-6 gap-2">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span>{item.location || "غير محدد"}</span>
                  </div>

                  <Link
                    href={`/items/${item._id}`}
                    className="w-full py-3 bg-primary text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg transition-all active:scale-95"
                  >
                    <span>عرض التفاصيل</span>
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
              inventory_2
            </span>
            <p className="text-gray-400 text-sm font-bold">
              لا توجد تبرعات تطابق البحث.
            </p>
          </div>
        )}
      </main>

      <Link
        href="/add-item"
        className="fixed bottom-8 left-8 bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform group z-50"
      >
        <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">
          add
        </span>
      </Link>
    </div>
  );
}