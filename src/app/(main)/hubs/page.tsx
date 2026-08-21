"use client";

import { useHubs } from "./hooks/useHubs";

export default function HubsPage() {
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
  } = useHubs();

  return (
    <div className="min-h-screen bg-[#f7f6f2]" dir="rtl">
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-24 md:px-8 md:pt-28">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.07] px-3.5 py-1.5 text-[11px] font-black tracking-wide text-primary">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              warehouse
            </span>
            مواقع موثوقة على مستوى المملكة
          </div>
          <h1 className="text-2xl font-black text-gray-900 md:text-3xl">
            مراكز التسليم
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-gray-400">
            نقاط تسليم آمنة وموثوقة منتشرة في مدن الأردن لتسهيل إيصال التبرعات
            بين المتبرعين والمستفيدين
          </p>
        </div>

        {!loading && !error && total > 0 && (
          <div className="mb-6 grid gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px]">
            <label className="relative block">
              <span className="sr-only">البحث في مراكز التسليم</span>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                search
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو العنوان..."
                className="w-full rounded-xl border border-gray-200 bg-[#faf9f6] py-3 pl-4 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">فلترة حسب المدينة</span>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                className="animate-pulse rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm"
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
            className="flex flex-col items-center rounded-2xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm"
          >
            <span className="material-symbols-outlined text-[34px] text-red-400">
              cloud_off
            </span>
            <p className="mt-3 text-sm font-black text-gray-800">{error}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-white transition hover:bg-primary/90"
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
                className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-black/[0.06]"
              >
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
                      <h2 className="text-[15px] font-black text-gray-900">
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
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-14 text-center">
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
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
