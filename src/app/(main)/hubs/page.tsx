"use client";

import { useHubs } from "./hooks/useHubs";

/* ─── بناء رابط Google Maps من العنوان + المدينة ─── */
function mapsUrl(address: string, city: string) {
  const q = encodeURIComponent(`${address}، ${city}، الأردن`);
  return `https://maps.google.com/?q=${q}`;
}

export default function HubsPage() {
  const { hubs, loading, error, search, setSearch, city, setCity, cities } = useHubs();

  return (
    <div className="bg-surface min-h-screen pb-24 text-[#191c1d]" dir="rtl">
      <main className="pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-body">

        {/* ── العنوان ── */}
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold font-headline mb-2">
            مراكز التسليم 🏪
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-md mx-auto">
            اختر أقرب مركز إليك لتسليم أو استلام التبرعات
          </p>
        </div>

        {/* ── بحث + فلتر المدينة ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* بحث */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المركز أو العنوان..."
              className="w-full bg-white border border-[#edeeef] rounded-xl pr-10 pl-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
            />
          </div>

          {/* فلتر المدينة */}
          <div className="relative">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="appearance-none bg-white border border-[#edeeef] rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-36"
            >
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">
              location_on
            </span>
          </div>
        </div>

        {/* ── حالات التحميل / الخطأ ── */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-red-300 mb-3 block">
              error
            </span>
            <p className="text-red-400 font-bold text-sm">{error}</p>
          </div>
        )}

        {/* ── empty state ── */}
        {!loading && !error && hubs.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <span className="material-symbols-outlined text-5xl text-primary/30 block">
              warehouse
            </span>
            <p className="text-on-surface-variant font-medium text-sm">
              لا توجد مراكز تطابق بحثك
            </p>
            <button
              onClick={() => { setSearch(""); setCity("الكل"); }}
              className="text-primary text-sm font-bold hover:underline"
            >
              مسح الفلاتر
            </button>
          </div>
        )}

        {/* ── شبكة البطاقات ── */}
        {!loading && !error && hubs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {hubs.map((hub) => (
              <div
                key={hub._id}
                className="bg-white rounded-2xl border border-[#edeeef] shadow-[0_4px_20px_rgba(0,97,85,0.06)] p-5 flex flex-col gap-4 hover:shadow-[0_8px_28px_rgba(0,97,85,0.1)] transition-shadow"
              >
                {/* رأس البطاقة */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">
                        warehouse
                      </span>
                    </div>
                    <div>
                      <h2 className="font-extrabold text-sm leading-tight">{hub.name}</h2>
                      <p className="text-xs text-on-surface-variant">{hub.city}</p>
                    </div>
                  </div>
                  {/* badge نشط */}
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full shrink-0">
                    نشط
                  </span>
                </div>

                {/* العنوان */}
                <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-base text-primary/50 mt-0.5 shrink-0">
                    location_on
                  </span>
                  <span>{hub.address}</span>
                </div>

                {/* ساعات العمل */}
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-base text-primary/50 shrink-0">
                    schedule
                  </span>
                  <span>{hub.workingHours}</span>
                </div>

                {/* زر Google Maps */}
                <a
                  href={mapsUrl(hub.address, hub.city)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs rounded-xl py-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  افتح في خرائط Google
                </a>
              </div>
            ))}
          </div>
        )}

        {/* عدد النتائج */}
        {!loading && !error && hubs.length > 0 && (
          <p className="text-center text-xs text-on-surface-variant mt-6">
            {hubs.length} مركز متاح
          </p>
        )}

      </main>
    </div>
  );
}