"use client";

import Link from "next/link";
import ItemCard from "@/components/ui/ItemCard";
import { useSettings } from "@/hooks/useSettings";
import { useBrowse } from "./hooks/useBrowse";

const CITIES = ["عمان", "إربد", "الزرقاء", "العقبة"] as const;

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-surface-container-high" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-4 w-full animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-px bg-surface-container-high" />
        <div className="h-3 w-28 animate-pulse rounded-full bg-surface-container-high" />
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const {
    items,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    retry,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
  } = useBrowse();

  const { categories, isLoading: settingsLoading } = useSettings();
  const hasActiveFilters =
    Boolean(searchQuery.trim()) || Boolean(selectedCity) || Boolean(selectedCategory);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedCategory("");
  };

  return (
    <div className="page-shell pb-20" dir="rtl">
      <section className="border-b border-black/[0.06] bg-white pt-20 md:pt-24">
        <div className="site-container grid gap-6 py-8 md:grid-cols-[1fr_auto] md:items-end md:py-11">
          <div className="max-w-2xl">
            <span className="eyebrow">
              <span className="material-symbols-outlined text-[15px]">search</span>
              تبرعات متاحة في مجتمعك
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
              اعثر على الغرض المناسب بسهولة
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-on-surface-variant md:text-base">
              ابحث حسب المدينة أو التصنيف، ثم راجع التفاصيل وطريقة التسليم قبل الحجز.
            </p>
          </div>

          <Link href="/add-item" className="btn-primary self-start md:self-auto">
            <span
              className="material-symbols-outlined text-[19px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_circle
            </span>
            إضافة تبرع
          </Link>
        </div>
      </section>

      <div className="site-container pt-6 md:pt-8">
        <section
          aria-labelledby="browse-filters-title"
          className="surface-card overflow-hidden"
        >
          <div className="flex flex-col gap-3 border-b border-black/[0.06] bg-primary-softer px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <div>
              <h2 id="browse-filters-title" className="text-base font-black text-on-surface">
                البحث والتصفية
              </h2>
              <p className="mt-1 text-xs text-on-surface-soft">
                استخدم حقلًا واحدًا أو اجمع أكثر من فلتر.
              </p>
            </div>
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/10 bg-white px-3 py-1.5 text-xs font-black text-primary"
              aria-live="polite"
            >
              <span className="material-symbols-outlined text-[15px]">inventory_2</span>
              {loading ? "جاري البحث" : `${total} نتيجة`}
            </span>
          </div>

          <div className="p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-12">
              <label className="block md:col-span-6">
                <span className="mb-2 block text-xs font-black text-on-surface-variant">
                  ماذا تبحث عنه؟
                </span>
                <span className="relative block">
                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft">
                    search
                  </span>
                  <input
                    type="search"
                    placeholder="مثال: كرسي مكتب أو كتب جامعية"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="field-control px-4 pr-11 text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70"
                  />
                </span>
              </label>

              <label className="block md:col-span-3">
                <span className="mb-2 block text-xs font-black text-on-surface-variant">
                  المدينة
                </span>
                <span className="relative block">
                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft">
                    location_on
                  </span>
                  <select
                    value={selectedCity}
                    onChange={(event) => setSelectedCity(event.target.value)}
                    className="field-control appearance-none px-4 pr-11 text-sm font-bold"
                  >
                    <option value="">كل المدن</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </span>
              </label>

              <label className="block md:col-span-3">
                <span className="mb-2 block text-xs font-black text-on-surface-variant">
                  التصنيف
                </span>
                <span className="relative block">
                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft">
                    category
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    disabled={settingsLoading || categories.length === 0}
                    className="field-control appearance-none px-4 pr-11 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <option value="">
                      {settingsLoading ? "جاري التحميل..." : "كل التصنيفات"}
                    </option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            </div>

            <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2 border-t border-black/[0.05] pt-4">
              {hasActiveFilters ? (
                <>
                  <span className="ml-1 text-[11px] font-black text-on-surface-soft">
                    الفلاتر النشطة:
                  </span>
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface-container-low px-3 text-[11px] font-black text-on-surface-variant hover:bg-primary-soft hover:text-primary"
                    >
                      “{searchQuery.trim()}”
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                  {selectedCity && (
                    <button
                      type="button"
                      onClick={() => setSelectedCity("")}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface-container-low px-3 text-[11px] font-black text-on-surface-variant hover:bg-primary-soft hover:text-primary"
                    >
                      {selectedCity}
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("")}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface-container-low px-3 text-[11px] font-black text-on-surface-variant hover:bg-primary-soft hover:text-primary"
                    >
                      {selectedCategory}
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mr-auto min-h-8 rounded-lg px-2.5 text-[11px] font-black text-danger hover:bg-danger-bg"
                  >
                    مسح الكل
                  </button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-soft">
                  <span className="material-symbols-outlined text-[15px]">info</span>
                  تظهر جميع الأغراض المتاحة حاليًا.
                </span>
              )}
            </div>

            {!settingsLoading && categories.length === 0 && (
              <p className="mt-3 text-xs font-bold text-danger">
                لا توجد تصنيفات متاحة حالياً
              </p>
            )}
          </div>
        </section>

        <div className="mb-5 mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">
              نتائج البحث
            </p>
            <h2 className="mt-1 text-xl font-black text-on-surface">
              {hasActiveFilters ? "الأغراض المطابقة" : "كل التبرعات"}
            </h2>
          </div>
          {!loading && !error && (
            <p className="text-xs font-bold text-on-surface-soft">{total} غرض</p>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : error ? (
          <section className="surface-card px-6 py-14 text-center" role="alert">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-bg text-danger">
              <span className="material-symbols-outlined text-[27px]">cloud_off</span>
            </span>
            <h2 className="mt-4 text-lg font-black">تعذّر عرض التبرعات</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-soft">{error}</p>
            <button type="button" onClick={retry} className="btn-primary mt-5">
              إعادة المحاولة
            </button>
          </section>
        ) : items.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, index) => (
                <ItemCard key={item._id} item={item} priority={index < 4} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="صفحات الأغراض"
                className="mt-9 flex flex-wrap items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary min-h-11 px-4 py-2 text-xs disabled:shadow-none"
                >
                  <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                  السابق
                </button>
                <span className="min-w-32 text-center text-xs font-black text-on-surface-variant">
                  صفحة {currentPage} من {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary min-h-11 px-4 py-2 text-xs disabled:shadow-none"
                >
                  التالي
                  <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                </button>
              </nav>
            )}
          </>
        ) : (
          <section className="surface-card border-dashed px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-soft">
              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
            </span>
            <h2 className="mt-4 text-lg font-black">لا توجد تبرعات تطابق بحثك</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-on-surface-soft">
              جرّب كلمة أوسع أو أزل بعض الفلاتر، ويمكنك أيضًا نشر طلب تبرع بالغرض الذي تحتاجه.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="btn-secondary">
                  مسح الفلاتر
                </button>
              )}
              <Link href="/donation-requests/new" className="btn-primary">
                إنشاء طلب تبرع
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
