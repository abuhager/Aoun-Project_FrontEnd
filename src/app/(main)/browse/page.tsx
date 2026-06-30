"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useBrowse } from "./hooks/useBrowse";
import { useSettings } from "@/hooks/useSettings";
import { useSiteConfig } from "@/context/SiteConfigContext";

const CITIES = ["عمان", "إربد", "الزرقاء", "العقبة"] as const;

/* ── Skeleton Card ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e8e2d9] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="h-56 w-full animate-pulse bg-[linear-gradient(135deg,#f3efe9_0%,#faf8f4_100%)]" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-[#ece6de]" />
        <div className="h-4 w-full animate-pulse rounded-full bg-[#f1ece5]" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#f1ece5]" />
        <div className="mt-4 h-11 w-full animate-pulse rounded-2xl bg-[#ece6de]" />
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
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#e9e3da] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(1,105,111,0.12)]"
    >
      <div className="relative h-56 w-full overflow-hidden bg-[#f3efe9]">
        <Image
          src={item.imageUrl || item.image || "/placeholder.png"}
          alt={item.title || item.name || "صورة الغرض"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
          priority={index < 4}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {item.condition ? (
            <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] font-black text-white backdrop-blur-md">
              {item.condition}
            </span>
          ) : (
            <span />
          )}

          {item.category && (
            <span className="rounded-full border border-white/15 bg-primary/90 px-3 py-1 text-[11px] font-black text-white shadow-sm backdrop-blur-sm">
              {item.category}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          {item.location || "غير محدد"}
        </div>
      </div>

      <div className="flex grow flex-col p-5">
        <div className="mb-2 text-[11px] font-extrabold tracking-[0.18em] text-[#b0a89f]">
          AOUN LISTING
        </div>

        <h3 className="grow text-[15px] font-black leading-7 text-[#231f1a] line-clamp-2">
          {item.title || item.name}
        </h3>

        <div className="mt-5 flex items-center justify-center gap-1.5 rounded-2xl border border-primary/15 bg-primary/[0.05] py-3 text-[13px] font-black text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
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
  const { platformName } = useSiteConfig();

  const { categories, isLoading: settingsLoading } = useSettings();

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(selectedCity) ||
    Boolean(selectedCategory);

  return (
    <div
      className="min-h-screen bg-[#f8f6f1] text-[#211d18]"
      dir="rtl"
      style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
    >
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-24 md:px-8 md:pt-28">
        {/* ── Hero Header ───────────────────────────────────── */}
        <section className="relative mb-7 overflow-hidden rounded-[34px] border border-[#e8e2d9] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-8">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-[#005a8c]/[0.05] blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-extrabold text-primary">
                <span className="material-symbols-outlined text-[15px]">
                  travel_explore
                </span>
                Explore community donations
              </div>

              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#1f312f] md:text-5xl">
                تصفّح التبرعات
                <span className="block text-primary">واختر ما يناسب حاجتك</span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-8 text-[#776f67] md:text-base">
                استكشف المواد والخدمات المتاحة داخل مجتمع {platformName} عبر تجربة تصفح أوضح،
                أسرع، وأسهل في الفرز والمقارنة.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <span className="rounded-full border border-[#e8e2d9] bg-white px-4 py-2 text-xs font-black text-[#655f59] shadow-sm">
                  {filteredItems.length} نتيجة متاحة
                </span>
                <span className="rounded-full border border-[#e8e2d9] bg-white px-4 py-2 text-xs font-black text-[#655f59] shadow-sm">
                  {settingsLoading ? "..." : `${categories.length} تصنيف`}
                </span>
                <span className="rounded-full border border-[#e8e2d9] bg-white px-4 py-2 text-xs font-black text-[#655f59] shadow-sm">
                  4 مدن رئيسية
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[28px] border border-[#ebe4db] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[20px]">
                    search
                  </span>
                </div>
                <p className="mt-6 text-2xl font-black text-[#1f312f]">
                  سريع
                </p>
                <p className="mt-1 text-xs leading-6 text-[#8b847c]">
                  بحث مباشر وفلاتر واضحة بدون تعقيد
                </p>
              </div>

              <div className="rounded-[28px] border border-[#ebe4db] bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf4fb] text-[#005a8c]">
                  <span className="material-symbols-outlined text-[20px]">
                    category
                  </span>
                </div>
                <p className="mt-6 text-2xl font-black text-[#1f312f]">
                  منظّم
                </p>
                <p className="mt-1 text-xs leading-6 text-[#8b847c]">
                  تصفّح حسب المدينة أو التصنيف بسهولة
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Filter Bar ───────────────────────────────────── */}
        <section className="mb-5 overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
          <div className="border-b border-[#f2ede6] bg-[#fcfaf7] px-5 py-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-black text-[#223433]">
                  البحث والتصفية
                </h2>
                <p className="mt-1 text-xs text-[#918981]">
                  استخدم الفلاتر للوصول إلى النتائج الأنسب بسرعة.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-black text-primary">
                <span className="material-symbols-outlined text-[14px]">
                  filter_alt
                </span>
                {filteredItems.length} نتيجة
              </div>
            </div>
          </div>

          <div className="p-4 md:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              {/* Search */}
              <div className="relative md:col-span-5">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-[#c3bbb1]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="ابحث عن غرض أو خدمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#e7e1d8] bg-[#faf8f4] pr-12 pl-4 text-[13px] font-bold text-[#24302f] placeholder:text-[#b4aca2] outline-none transition-all duration-300 focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
                />
              </div>

              {/* City */}
              <div className="relative md:col-span-3">
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-[#c3bbb1]">
                  location_on
                </span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-[#e7e1d8] bg-[#faf8f4] pr-12 pl-4 text-[13px] font-bold text-[#5e5852] outline-none transition-all duration-300 focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
                >
                  <option value="">كل المدن</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="relative md:col-span-3">
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-[#c3bbb1]">
                  category
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={settingsLoading || categories.length === 0}
                  className="h-12 w-full appearance-none rounded-2xl border border-[#e7e1d8] bg-[#faf8f4] pr-12 pl-4 text-[13px] font-bold text-[#5e5852] outline-none transition-all duration-300 focus:border-primary/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
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

              {/* Count Pill */}
              <div className="flex items-center justify-start md:col-span-1 md:justify-center">
                <span className="whitespace-nowrap rounded-2xl bg-primary/[0.08] px-3 py-2 text-[12px] font-black text-primary">
                  {filteredItems.length}
                </span>
              </div>
            </div>

            {/* Active filters */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {hasActiveFilters ? (
                <>
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e2d9] bg-[#f5f1eb] px-3 py-1.5 text-[11px] font-black text-[#5f5953] transition-all duration-300 hover:border-primary/20 hover:text-primary"
                    >
                      بحث: {searchQuery}
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  )}

                  {selectedCity && (
                    <button
                      type="button"
                      onClick={() => setSelectedCity("")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e2d9] bg-[#f5f1eb] px-3 py-1.5 text-[11px] font-black text-[#5f5953] transition-all duration-300 hover:border-primary/20 hover:text-primary"
                    >
                      المدينة: {selectedCity}
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  )}

                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e2d9] bg-[#f5f1eb] px-3 py-1.5 text-[11px] font-black text-[#5f5953] transition-all duration-300 hover:border-primary/20 hover:text-primary"
                    >
                      التصنيف: {selectedCategory}
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  )}
                </>
              ) : (
                <span className="text-[12px] font-bold text-[#aaa298]">
                  لا توجد فلاتر مفعّلة حالياً
                </span>
              )}
            </div>

            {!settingsLoading && categories.length === 0 && (
              <p className="mt-3 text-[12px] font-bold text-red-500">
                لا توجد تصنيفات متاحة حالياً
              </p>
            )}
          </div>
        </section>

        {/* ── Listing Management ───────────────────────────── */}
        <section className="mb-5 flex flex-col gap-3 rounded-[24px] border border-[#e8e2d9] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-[#223433]">
              نتائج التصفح
            </p>
            <p className="mt-1 text-xs text-[#918981]">
              بطاقات مختصرة تركز على الصورة، العنوان، والمعلومة الأهم فقط.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f1eb] px-3 py-2 text-[12px] font-black text-[#5f5953]">
            <span className="material-symbols-outlined text-[15px] text-primary">
              grid_view
            </span>
            {loading ? "جاري التحميل..." : `${filteredItems.length} عنصر`}
          </div>
        </section>

        {/* ── Grid ─────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredItems.map((item, index) => (
              <ItemCard key={item._id} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-[#d9d2c9] bg-white py-20 text-center shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#f6f2eb]">
              <span
                className="material-symbols-outlined text-[30px] text-[#b6aea4]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                inventory_2
              </span>
            </div>

            <p className="mt-5 text-[16px] font-black text-[#5c564f]">
              لا توجد تبرعات تطابق البحث
            </p>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-7 text-[#9a9289]">
              جرّب إزالة بعض الفلاتر أو استخدام كلمات بحث مختلفة للوصول إلى نتائج أكثر.
            </p>

            {hasActiveFilters && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="rounded-full border border-[#e6e0d7] bg-[#faf8f4] px-4 py-2 text-xs font-black text-[#5e5852] transition-all duration-300 hover:border-primary/20 hover:text-primary"
                  >
                    إزالة البحث
                  </button>
                )}

                {selectedCity && (
                  <button
                    type="button"
                    onClick={() => setSelectedCity("")}
                    className="rounded-full border border-[#e6e0d7] bg-[#faf8f4] px-4 py-2 text-xs font-black text-[#5e5852] transition-all duration-300 hover:border-primary/20 hover:text-primary"
                  >
                    إزالة المدينة
                  </button>
                )}

                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className="rounded-full border border-[#e6e0d7] bg-[#faf8f4] px-4 py-2 text-xs font-black text-[#5e5852] transition-all duration-300 hover:border-primary/20 hover:text-primary"
                  >
                    إزالة التصنيف
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Floating Add Button ───────────────────────────── */}
      <Link
        href="/add-item"
        aria-label="إضافة تبرع"
        className="group fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-[0_18px_35px_rgba(1,105,111,0.30)] transition-all duration-300 hover:scale-110 hover:shadow-[0_24px_40px_rgba(1,105,111,0.36)] active:scale-95"
      >
        <span className="material-symbols-outlined text-[24px] text-white transition-transform duration-300 group-hover:rotate-90">
          add
        </span>
      </Link>
    </div>
  );
}