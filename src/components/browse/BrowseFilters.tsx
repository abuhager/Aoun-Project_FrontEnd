import BrowseFilterSelect from "@/components/browse/BrowseFilterSelect";
import BrowseLiveSearchInput from "@/components/browse/BrowseLiveSearchInput";
import { isBrowseSearchReady } from "@/lib/navigation/browseSearch";

type BrowseFiltersProps = {
  categories: string[];
  locations: string[];
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
  loading: boolean;
  total: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearSearch: () => void;
  onClearFilters: () => void;
};

export default function BrowseFilters({
  categories,
  locations,
  searchQuery,
  selectedCategory,
  selectedLocation,
  loading,
  total,
  hasActiveFilters,
  onSearchChange,
  onLocationChange,
  onCategoryChange,
  onClearSearch,
  onClearFilters,
}: BrowseFiltersProps) {
  return (
    <section aria-labelledby="browse-filters-title" className="content-panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-black/[0.06] bg-primary-softer px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div>
          <h2 id="browse-filters-title" className="text-base font-black text-on-surface">
            البحث والتصفية
          </h2>
          <p className="mt-1 text-xs text-on-surface-soft">
            اكتب ما تبحث عنه وستتحدث النتائج تلقائياً، ويمكنك الجمع بين أكثر من فلتر.
          </p>
        </div>
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/10 bg-white px-3 py-1.5 text-xs font-black text-primary"
          aria-live="polite"
        >
          <span className="material-symbols-outlined text-[15px]">inventory_2</span>
          {loading ? "جاري البحث..." : `${total} نتيجة`}
        </span>
      </div>

      <div className="p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-12">
          <BrowseLiveSearchInput value={searchQuery} onValueChange={onSearchChange} />
          <BrowseFilterSelect
            label="المنطقة"
            value={selectedLocation}
            allLabel="كل المناطق"
            options={locations}
            onValueChange={onLocationChange}
          />
          <BrowseFilterSelect
            label="التصنيف"
            value={selectedCategory}
            allLabel="كل التصنيفات"
            options={categories}
            disabled={categories.length === 0}
            onValueChange={onCategoryChange}
          />
        </div>

        <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2 border-t border-black/[0.05] pt-4">
          {hasActiveFilters ? (
            <>
              <span className="ml-1 text-[11px] font-black text-on-surface-soft">
                الفلاتر النشطة:
              </span>
              {isBrowseSearchReady(searchQuery) && (
                <button type="button" onClick={onClearSearch} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface-container-low px-3 text-[11px] font-black text-on-surface-variant hover:bg-primary-soft hover:text-primary">
                  “{searchQuery.trim()}”
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
              {selectedLocation && (
                <button type="button" onClick={() => onLocationChange("")} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface-container-low px-3 text-[11px] font-black text-on-surface-variant hover:bg-primary-soft hover:text-primary">
                  {selectedLocation}
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
              {selectedCategory && (
                <button type="button" onClick={() => onCategoryChange("")} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface-container-low px-3 text-[11px] font-black text-on-surface-variant hover:bg-primary-soft hover:text-primary">
                  {selectedCategory}
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
              <button type="button" onClick={onClearFilters} className="mr-auto min-h-8 rounded-lg px-2.5 py-2 text-[11px] font-black text-danger hover:bg-danger-bg">
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

        {categories.length === 0 && (
          <p className="mt-3 text-xs font-bold text-danger">
            لا توجد تصنيفات متاحة حالياً
          </p>
        )}
      </div>
    </section>
  );
}
