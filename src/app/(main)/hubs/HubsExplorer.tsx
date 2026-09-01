"use client";

import { useHubs } from "./hooks/useHubs";
import PageIntro from "@/components/ui/PageIntro";
import type { SafeHub } from "@/types/hub.types";

export default function HubsExplorer({ initialHubs }: { initialHubs: SafeHub[] }) {
  const {
    hubs,
    total,
    loading,
    error,
    refetch,
    search,
    setSearch,
    city,
    setCity,
    cities,
  } = useHubs(initialHubs);

  return (
    <div className="page-shell pt-20" dir="rtl">
      <section className="site-container space-y-6 pb-20 md:pt-4">
        <PageIntro
          eyebrow="تنسيق تسليم أوضح"
          title="نقاط التسليم"
          description="أماكن يقترحها فريق المنصة لتنسيق الاستلام بعيدًا عن مشاركة العناوين الشخصية. تحقّق من توفر النقطة وساعاتها قبل التوجه إليها."
          icon="warehouse"
          tone="ink"
          meta={
            <>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                بيانات تجريبية خلال مرحلة الإطلاق المحدود
              </span>
              {!loading && !error && <span className="data-chip">{total} مركز متاح</span>}
              <span className="data-chip">التوفر النهائي يحتاج تأكيدًا مسبقًا</span>
            </>
          }
        />

        {!loading && !error && total > 0 && (
          <div className="content-panel grid gap-3 p-4 sm:grid-cols-[1fr_180px]">
            <label className="relative block">
              <span className="sr-only">البحث في مراكز التسليم</span>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                search
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو العنوان..."
                className="field-control py-3 pl-4 pr-10 text-sm font-bold"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">فلترة حسب المدينة</span>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="field-control appearance-none px-4 py-3 text-sm font-bold"
              >
                {cities.map((option) => (
                  <option key={option} value={option}>
                    {option === "الكل" ? "كل المدن" : option}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                expand_more
              </span>
            </label>
          </div>
        )}

        {loading && (
          <div className="grid gap-4 md:grid-cols-2" aria-label="جاري تحميل المراكز">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/5 rounded-lg bg-gray-100" />
                    <div className="h-3 w-3/5 rounded-lg bg-gray-100" />
                    <div className="h-3 w-4/5 rounded-lg bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="surface-card flex flex-col items-center px-6 py-14 text-center"
          >
            <span className="material-symbols-outlined text-[34px] text-red-400">
              cloud_off
            </span>
            <p className="mt-3 text-sm font-black text-gray-800">{error}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="btn-primary mt-5 text-xs"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {!loading && !error && hubs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {hubs.map((hub) => (
              <article
                key={hub._id}
                className="content-panel group relative overflow-hidden p-5 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_42px_rgba(16,37,34,0.09)]"
              >
                <span className="absolute inset-y-0 right-0 w-1 bg-primary/55" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] transition-colors duration-200 group-hover:bg-primary/[0.14]">
                    <span
                      className="material-symbols-outlined text-[24px] text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      warehouse
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[15px] font-black text-on-surface">
                        {hub.name}
                      </h2>
                      <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600">
                        متاح
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-start gap-2 text-[12px] text-gray-500">
                        <span className="material-symbols-outlined mt-0.5 text-[15px] text-primary">
                          location_on
                        </span>
                        <span>{hub.city} — {hub.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-500">
                        <span className="material-symbols-outlined text-[15px] text-primary">
                          schedule
                        </span>
                        {hub.workingHours}
                      </div>
                    </div>

                    {hub.coordinates && (
                      <a
                        href={`https://maps.google.com/?q=${hub.coordinates.lat},${hub.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-primary hover:underline"
                      >
                        فتح الموقع على الخريطة
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && total > 0 && hubs.length === 0 && (
          <div className="surface-card border-dashed py-14 text-center">
            <p className="text-sm font-black text-gray-700">لا توجد نتائج مطابقة</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCity("الكل");
              }}
              className="mt-3 text-xs font-black text-primary hover:underline"
            >
              مسح البحث والفلاتر
            </button>
          </div>
        )}

        {!loading && !error && total === 0 && (
          <div className="surface-card flex flex-col items-center justify-center border-dashed py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <span className="material-symbols-outlined text-[30px] text-gray-300">
                warehouse
              </span>
            </div>
            <p className="text-[15px] font-black text-gray-700">
              لا توجد مراكز تسليم متاحة حالياً
            </p>
            <p className="mt-1 text-[13px] text-gray-400">
              يتم إضافة المراكز من لوحة الإدارة
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
