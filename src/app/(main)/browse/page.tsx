// src/app/(main)/browse/page.tsx  ✅ REDESIGNED
"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useBrowse } from "./hooks/useBrowse";
import { useSettings } from "@/hooks/useSettings";

const CITIES = ["عمان", "إربد", "الزرقاء", "العقبة"] as const;

/* ── Skeleton Card ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
      <div className="h-52 w-full animate-pulse bg-gradient-to-br from-gray-100 to-gray-50" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
        <div className="h-4 w-full animate-pulse rounded-full bg-gray-100" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-100" />
        <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

/* ── Item Card ────────────────────────────────────────────────── */
function ItemCard({
  item,
  index,
}: {
  item: {
    _id: string;
    title?: string;
    name?: string;
    imageUrl?: string;
    image?: string;
    location?: string;
    condition?: string;
    category?: string;
  };
  index: number;
}) {
  return (
    <Link
      href={`/items/${item._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl
                 border border-black/[0.06] bg-white shadow-sm
                 transition-all duration-300 hover:-translate-y-1
                 hover:shadow-lg hover:shadow-black/[0.08]"
    >
      {/* صورة الغرض */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-50">
        <Image
          src={item.imageUrl || item.image || "/placeholder.png"}
          alt={item.title || item.name || "صورة الغرض"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
          priority={index < 4}
          className="object-cover transition-transform duration-500
                     group-hover:scale-105"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t
                     from-black/20 via-transparent to-transparent"
        />
        {item.condition && (
          <span
            className="absolute right-3 top-3 rounded-full border border-white/30
                       bg-black/30 px-2.5 py-0.5 text-[11px] font-black
                       text-white backdrop-blur-md"
          >
            {item.condition}
          </span>
        )}
        {item.category && (
          <span
            className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5
                       py-0.5 text-[11px] font-black text-white backdrop-blur-sm"
          >
            {item.category}
          </span>
        )}
      </div>

      {/* محتوى البطاقة */}
      <div className="flex grow flex-col p-4">
        <div className="mb-2 flex items-center gap-1 text-[12px]
                        font-semibold text-gray-400">
          <span className="material-symbols-outlined text-[14px] text-primary">
            location_on
          </span>
          {item.location || "غير محدد"}
        </div>

        <h3
          className="grow text-[15px] font-black leading-snug text-gray-900
                     line-clamp-2"
        >
          {item.title || item.name}
        </h3>

        <div
          className="mt-4 flex items-center justify-center gap-1.5 rounded-xl
                     border border-primary/20 bg-primary/[0.05] py-2.5
                     text-[13px] font-black text-primary transition-all
                     duration-200 group-hover:border-primary group-hover:bg-primary
                     group-hover:text-white"
        >
          عرض التفاصيل
          <span className="material-symbols-outlined text-[15px]">
            arrow_back
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
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
    <div className="min-h-screen bg-[#f7f6f2] text-gray-900" dir="rtl">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 md:px-8 md:pt-28">

        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="mb-7">
          <h1 className="text-2xl font-black text-gray-900 md:text-3xl">
            تصفح التبرعات المتاحة
          </h1>
          <p className="mt-1 text-[13px] text-gray-400">
            اكتشف الأغراض والخدمات التي يحتاجها مجتمعك
          </p>
        </div>

        {/* ── شريط الفلتر ───────────────────────────────────────── */}
        <section
          className="mb-7 rounded-2xl border border-black/[0.06]
                     bg-white p-4 shadow-sm md:p-5"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">

            {/* حقل البحث */}
            <div className="relative md:col-span-5">
              <span
                className="material-symbols-outlined absolute right-3.5 top-1/2
                           -translate-y-1/2 text-[20px] text-gray-300"
              >
                search
              </span>
              <input
                type="text"
                placeholder="ابحث عن غرض..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-black/[0.07]
                           bg-gray-50 pr-11 pl-4 text-[13px] font-bold
                           text-gray-900 placeholder:text-gray-400
                           outline-none transition-all duration-200
                           focus:border-primary/40 focus:bg-white
                           focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* فلتر المدينة */}
            <div className="relative md:col-span-3">
              <span
                className="material-symbols-outlined pointer-events-none absolute
                           right-3.5 top-1/2 -translate-y-1/2 text-[20px] text-gray-300"
              >
                location_on
              </span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border
                           border-black/[0.07] bg-gray-50 pr-11 pl-4 text-[13px]
                           font-bold text-gray-700 outline-none transition-all
                           duration-200 focus:border-primary/40 focus:bg-white
                           focus:ring-2 focus:ring-primary/10 cursor-pointer"
              >
                <option value="">كل المدن</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* فلتر الفئة */}
            <div className="relative md:col-span-3">
              <span
                className="material-symbols-outlined pointer-events-none absolute
                           right-3.5 top-1/2 -translate-y-1/2 text-[20px] text-gray-300"
              >
                category
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={settingsLoading || categories.length === 0}
                className="h-11 w-full appearance-none rounded-xl border
                           border-black/[0.07] bg-gray-50 pr-11 pl-4 text-[13px]
                           font-bold text-gray-700 outline-none transition-all
                           duration-200 focus:border-primary/40 focus:bg-white
                           focus:ring-2 focus:ring-primary/10 cursor-pointer
                           disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {settingsLoading ? "جاري تحميل التصنيفات..." : "كل التصنيفات"}
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* عداد النتائج */}
            <div className="flex items-center justify-center md:col-span-1">
              <span
                className="whitespace-nowrap rounded-xl bg-primary/[0.08] px-3
                           py-2 text-[12px] font-black text-primary"
              >
                {filteredItems.length} نتيجة
              </span>
            </div>
          </div>

          {!settingsLoading && categories.length === 0 && (
            <p className="mt-3 text-[12px] font-bold text-red-500">
              لا توجد تصنيفات متاحة حالياً
            </p>
          )}
        </section>

        {/* ── الشبكة ────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredItems.map((item, index) => (
              <ItemCard key={item._id} item={item} index={index} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div
            className="flex flex-col items-center justify-center rounded-2xl
                       border border-dashed border-gray-200 bg-white py-16 text-center"
          >
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center
                         rounded-2xl bg-gray-50"
            >
              <span
                className="material-symbols-outlined text-[30px] text-gray-300"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                inventory_2
              </span>
            </div>
            <p className="text-[15px] font-black text-gray-700">
              لا توجد تبرعات تطابق البحث
            </p>
            <p className="mt-1 text-[13px] text-gray-400">
              جرب تعديل كلمات البحث أو الفلاتر
            </p>
          </div>
        )}
      </main>

      {/* ── زر الإضافة العائم ─────────────────────────────────── */}
      <Link
        href="/add-item"
        aria-label="إضافة تبرع"
        className="group fixed bottom-6 left-6 z-50 flex h-14 w-14
                   items-center justify-center rounded-full bg-primary
                   shadow-xl shadow-primary/30 transition-all duration-300
                   hover:scale-110 hover:shadow-2xl hover:shadow-primary/40
                   active:scale-95"
      >
        <span
          className="material-symbols-outlined text-[24px] text-white
                     transition-transform duration-300 group-hover:rotate-90"
        >
          add
        </span>
      </Link>
    </div>
  );
}