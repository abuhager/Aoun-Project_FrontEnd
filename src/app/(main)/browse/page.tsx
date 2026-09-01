import type { Metadata } from "next";
import Link from "next/link";
import ItemCard from "@/components/ui/ItemCard";
import PageIntro from "@/components/ui/PageIntro";
import {
  getPublicItemsServer,
  resolvePublicAssetUrl,
} from "@/lib/api/publicApiServer";
import { getServerPublicSettings } from "@/lib/api/publicSettingsServer";

export const metadata: Metadata = {
  title: "تصفح التبرعات",
  description: "استعرض الأغراض المتاحة للتبرع وابحث حسب المدينة والتصنيف.",
};

type BrowseSearchParams = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const normalizePage = (value: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const buildBrowseHref = (
  values: { search: string; location: string; category: string; page: number },
  overrides: Partial<{ search: string; location: string; category: string; page: number }>
) => {
  const next = { ...values, ...overrides };
  const params = new URLSearchParams();
  if (next.search) params.set("search", next.search);
  if (next.location) params.set("location", next.location);
  if (next.category) params.set("category", next.category);
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `/browse?${query}` : "/browse";
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<BrowseSearchParams>;
}) {
  const rawParams = await searchParams;
  const values = {
    search: firstValue(rawParams.search).trim().slice(0, 100),
    location: firstValue(rawParams.location).trim(),
    category: firstValue(rawParams.category).trim(),
    page: normalizePage(firstValue(rawParams.page)),
  };

  const [settings, result] = await Promise.all([
    getServerPublicSettings(),
    getPublicItemsServer({
      page: values.page,
      limit: 12,
      search: values.search || undefined,
      location: values.location || undefined,
      category: values.category || undefined,
    }).catch(() => null),
  ]);

  const items = result?.items ?? [];
  const total = result?.total ?? 0;
  const currentPage = result?.page ?? values.page;
  const totalPages = Math.max(1, result?.pages ?? 1);
  const categories = settings?.categories ?? [];
  const locations = settings?.locations ?? ["عمان", "إربد", "الزرقاء", "العقبة"];
  const hasActiveFilters = Boolean(values.search || values.location || values.category);
  const browseReturnTo = buildBrowseHref(values, { page: currentPage });

  return (
    <div className="page-shell pb-20 pt-20" dir="rtl">
      <div className="site-container space-y-6 md:pt-4">
        <PageIntro
          eyebrow="سوق مجتمعي بلا مقابل"
          title="اكتشف التبرعات المتاحة"
          description="ابحث بالاسم أو المدينة أو التصنيف، ثم راجع حالة الغرض وخيار التسليم قبل إرسال طلب الحجز."
          icon="travel_explore"
          actions={
            <Link
              href="/add-item"
              className="rounded-xl bg-white px-5 py-3 text-xs font-black text-primary-container shadow-lg hover:-translate-y-0.5"
            >
              <span
                className="material-symbols-outlined ml-1 text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add_circle
              </span>
              إضافة تبرع
            </Link>
          }
          meta={
            <>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                {result ? `${total} غرض متاح` : "تعذّر تحديث النتائج"}
              </span>
              <span className="data-chip">حجز منظم</span>
              <span className="data-chip">تسليم موثّق من الطرفين</span>
            </>
          }
        />

        <section aria-labelledby="browse-filters-title" className="content-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-black/[0.06] bg-primary-softer px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <div>
              <h2 id="browse-filters-title" className="text-base font-black text-on-surface">
                البحث والتصفية
              </h2>
              <p className="mt-1 text-xs text-on-surface-soft">
                الفلاتر محفوظة في الرابط، لذلك تبقى عند فتح غرض ثم الرجوع.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/10 bg-white px-3 py-1.5 text-xs font-black text-primary">
              <span className="material-symbols-outlined text-[15px]">inventory_2</span>
              {total} نتيجة
            </span>
          </div>

          <form action="/browse" method="get" className="p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-12">
              <label className="block md:col-span-5">
                <span className="mb-2 block text-xs font-black text-on-surface-variant">
                  ماذا تبحث عنه؟
                </span>
                <span className="relative block">
                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft">
                    search
                  </span>
                  <input
                    type="search"
                    name="search"
                    defaultValue={values.search}
                    maxLength={100}
                    placeholder="مثال: كرسي مكتب أو كتب جامعية"
                    className="field-control px-4 pr-11 text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70"
                  />
                </span>
              </label>

              <label className="block md:col-span-3">
                <span className="mb-2 block text-xs font-black text-on-surface-variant">المدينة</span>
                <select
                  name="location"
                  defaultValue={values.location}
                  className="field-control appearance-none px-4 text-sm font-bold"
                >
                  <option value="">كل المدن</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-3">
                <span className="mb-2 block text-xs font-black text-on-surface-variant">التصنيف</span>
                <select
                  name="category"
                  defaultValue={values.category}
                  className="field-control appearance-none px-4 text-sm font-bold"
                >
                  <option value="">كل التصنيفات</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <div className="flex items-end md:col-span-1">
                <button type="submit" className="btn-primary min-h-12 w-full px-3">
                  بحث
                </button>
              </div>
            </div>

            <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2 border-t border-black/[0.05] pt-4">
              {hasActiveFilters ? (
                <>
                  <span className="ml-1 text-[11px] font-black text-on-surface-soft">الفلاتر النشطة:</span>
                  {values.search && (
                    <Link
                      href={buildBrowseHref(values, { search: "", page: 1 })}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface-container-low px-3 text-[11px] font-black text-on-surface-variant hover:bg-primary-soft hover:text-primary"
                    >
                      “{values.search}”
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </Link>
                  )}
                  {values.location && (
                    <Link
                      href={buildBrowseHref(values, { location: "", page: 1 })}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface-container-low px-3 text-[11px] font-black text-on-surface-variant hover:bg-primary-soft hover:text-primary"
                    >
                      {values.location}
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </Link>
                  )}
                  {values.category && (
                    <Link
                      href={buildBrowseHref(values, { category: "", page: 1 })}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface-container-low px-3 text-[11px] font-black text-on-surface-variant hover:bg-primary-soft hover:text-primary"
                    >
                      {values.category}
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </Link>
                  )}
                  <Link href="/browse" className="mr-auto min-h-8 rounded-lg px-2.5 py-2 text-[11px] font-black text-danger hover:bg-danger-bg">
                    مسح الكل
                  </Link>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-soft">
                  <span className="material-symbols-outlined text-[15px]">info</span>
                  تظهر جميع الأغراض المتاحة حاليًا.
                </span>
              )}
            </div>
          </form>
        </section>

        <div className="mb-5 mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">نتائج البحث</p>
            <h2 className="mt-1 text-xl font-black text-on-surface">
              {hasActiveFilters ? "الأغراض المطابقة" : "كل التبرعات"}
            </h2>
          </div>
          {result && <p className="text-xs font-bold text-on-surface-soft">{total} غرض</p>}
        </div>

        {!result ? (
          <section className="content-panel px-6 py-14 text-center" role="alert">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-bg text-danger">
              <span className="material-symbols-outlined text-[27px]">cloud_off</span>
            </span>
            <h2 className="mt-4 text-lg font-black">تعذّر عرض التبرعات</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-soft">
              تحقق من الاتصال وحاول تحميل الصفحة مجددًا.
            </p>
            <Link href={browseReturnTo} className="btn-primary mt-5">إعادة المحاولة</Link>
          </section>
        ) : items.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, index) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  imageSrc={resolvePublicAssetUrl(item.imageUrl)}
                  priority={index < 4}
                  returnTo={browseReturnTo}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav aria-label="صفحات الأغراض" className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={buildBrowseHref(values, { page: Math.max(1, currentPage - 1) })}
                  aria-disabled={currentPage === 1}
                  className={`btn-secondary min-h-11 px-4 py-2 text-xs ${currentPage === 1 ? "pointer-events-none opacity-45" : ""}`}
                >
                  <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                  السابق
                </Link>
                <span className="min-w-32 text-center text-xs font-black text-on-surface-variant">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Link
                  href={buildBrowseHref(values, { page: Math.min(totalPages, currentPage + 1) })}
                  aria-disabled={currentPage === totalPages}
                  className={`btn-secondary min-h-11 px-4 py-2 text-xs ${currentPage === totalPages ? "pointer-events-none opacity-45" : ""}`}
                >
                  التالي
                  <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                </Link>
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
              {hasActiveFilters && <Link href="/browse" className="btn-secondary">مسح الفلاتر</Link>}
              <Link href="/donation-requests/new" className="btn-primary">إنشاء طلب تبرع</Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
