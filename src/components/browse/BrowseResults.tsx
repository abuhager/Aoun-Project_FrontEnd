import Link from "next/link";
import ItemCard from "@/components/ui/ItemCard";
import type { Item } from "@/types/item.types";

type BrowseResultsProps = {
  items: Item[];
  loading: boolean;
  error: string;
  total: number;
  currentPage: number;
  totalPages: number;
  hasActiveFilters: boolean;
  returnTo: string;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onClearFilters: () => void;
};

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[17px] border border-black/[0.075] bg-white shadow-sm">
      <div className="aspect-[5/4] animate-pulse bg-surface-container-high" />
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

export default function BrowseResults({
  items,
  loading,
  error,
  total,
  currentPage,
  totalPages,
  hasActiveFilters,
  returnTo,
  onPageChange,
  onRetry,
  onClearFilters,
}: BrowseResultsProps) {
  return (
    <>
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

      <div aria-busy={loading} aria-live="polite">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : error ? (
          <section className="content-panel px-6 py-14 text-center" role="alert">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-bg text-danger">
              <span className="material-symbols-outlined text-[27px]">cloud_off</span>
            </span>
            <h2 className="mt-4 text-lg font-black">تعذّر عرض التبرعات</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-soft">{error}</p>
            <button type="button" onClick={onRetry} className="btn-primary mt-5">
              إعادة المحاولة
            </button>
          </section>
        ) : items.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, index) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  imageSrc={item.imageUrl}
                  priority={index < 4}
                  returnTo={returnTo}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav aria-label="صفحات الأغراض" className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="btn-secondary min-h-11 px-4 py-2 text-xs disabled:shadow-none">
                  <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                  السابق
                </button>
                <span className="min-w-32 text-center text-xs font-black text-on-surface-variant">
                  صفحة {currentPage} من {totalPages}
                </span>
                <button type="button" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="btn-secondary min-h-11 px-4 py-2 text-xs disabled:shadow-none">
                  التالي
                  <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                </button>
              </nav>
            )}
          </>
        ) : (
          <section className="content-panel border-dashed px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-soft">
              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
            </span>
            <h2 className="mt-4 text-lg font-black">لا توجد تبرعات تطابق بحثك</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-on-surface-soft">
              جرّب كلمة أوسع أو أزل بعض الفلاتر، ويمكنك أيضًا نشر طلب بالغرض الذي تحتاجه.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              {hasActiveFilters && (
                <button type="button" onClick={onClearFilters} className="btn-secondary">
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
    </>
  );
}
