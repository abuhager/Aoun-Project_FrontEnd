// src/app/(main)/hubs/page.tsx  ✅ REDESIGNED
"use client";

import { useHubs } from "./hooks/useHubs";
import Navbar from "@/components/Navbar";

export default function HubsPage() {
  const { hubs, loading } = useHubs();

  return (
    <div className="min-h-screen bg-[#f7f6f2]" dir="rtl">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-24 md:px-8 md:pt-28">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full
                          border border-primary/15 bg-primary/[0.07] px-3.5
                          py-1.5 text-[11px] font-black tracking-wide text-primary">
            <span className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
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

        {/* ── Skeleton ────────────────────────────────────────── */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-black/[0.06]
                           bg-white p-5 shadow-sm"
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

        {/* ── Grid ────────────────────────────────────────────── */}
        {!loading && hubs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {hubs.map((hub: {
              _id: string;
              name: string;
              city?: string;
              address?: string;
              phone?: string;
              workingHours?: string;
              isActive?: boolean;
            }) => (
              <div
                key={hub._id}
                className="group relative overflow-hidden rounded-2xl border
                           border-black/[0.06] bg-white p-5 shadow-sm
                           transition-all duration-200 hover:shadow-md
                           hover:shadow-black/[0.06]"
              >
                {/* خلفية تدرج خفيف */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-l
                             from-primary/[0.03] to-transparent opacity-0
                             transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative flex items-start gap-4">
                  {/* أيقونة المركز */}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center
                               rounded-xl bg-primary/[0.08] transition-colors
                               duration-200 group-hover:bg-primary/[0.14]"
                  >
                    <span
                      className="material-symbols-outlined text-[24px] text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      warehouse
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[15px] font-black text-gray-900">
                        {hub.name}
                      </h2>
                      {hub.isActive !== undefined && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px]
                                      font-black
                                      ${hub.isActive
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                        : "bg-gray-100 text-gray-400 border border-gray-200"
                                      }`}
                        >
                          {hub.isActive ? "نشط" : "مغلق"}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      {hub.city && (
                        <div className="flex items-center gap-2 text-[12px] text-gray-500">
                          <span className="material-symbols-outlined text-[15px] text-primary">
                            location_on
                          </span>
                          {hub.city}
                          {hub.address && ` — ${hub.address}`}
                        </div>
                      )}
                      {hub.phone && (
                        <div className="flex items-center gap-2 text-[12px] text-gray-500">
                          <span className="material-symbols-outlined text-[15px] text-primary">
                            phone
                          </span>
                          <span dir="ltr">{hub.phone}</span>
                        </div>
                      )}
                      {hub.workingHours && (
                        <div className="flex items-center gap-2 text-[12px] text-gray-500">
                          <span className="material-symbols-outlined text-[15px] text-primary">
                            schedule
                          </span>
                          {hub.workingHours}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ─────────────────────────────────────── */}
        {!loading && hubs.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-2xl
                       border border-dashed border-gray-200 bg-white py-16 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center
                            rounded-2xl bg-gray-50">
              <span
                className="material-symbols-outlined text-[30px] text-gray-300"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
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
      </main>
    </div>
  );
}