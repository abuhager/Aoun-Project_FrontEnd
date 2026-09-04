"use client";

import type { SafeHub } from "@/types/hub.types";

type HubListProps = {
  hubs: SafeHub[];
  loading: boolean;
  loadError: string;
  busy: Record<string, boolean>;
  onRetry: () => void;
  onEdit: (hub: SafeHub) => void;
  onToggleActive: (hub: SafeHub) => void;
};

export default function HubList({
  hubs,
  loading,
  loadError,
  busy,
  onRetry,
  onEdit,
  onToggleActive,
}: HubListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2" role="status" aria-label="جاري تحميل مراكز التسليم">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[190px] animate-pulse rounded-[28px] border border-[#ece7df] bg-white"
          />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-[28px] border border-red-100 bg-white py-16 text-center shadow-sm" role="alert">
        <span className="material-symbols-outlined text-[32px] text-red-400">cloud_off</span>
        <p className="mt-4 text-sm font-black text-[#5d5750]">{loadError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-white"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (hubs.length === 0) {
    return (
      <div className="rounded-[28px] border border-[#e8e2d9] bg-white py-20 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f4f1eb] text-[#a89f95]">
          <span className="material-symbols-outlined text-[30px]">warehouse</span>
        </div>
        <p className="mt-5 text-base font-black text-[#5d5750]">
          لا توجد مراكز تطابق الفلتر
        </p>
        <p className="mt-1 text-sm text-[#9f978e]">
          جرّب تغيير حالة الفلترة أو تعديل كلمات البحث
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {hubs.map((hub) => (
        <article
          key={hub._id}
          className={`group rounded-[28px] border p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)] ${
            hub.isActive
              ? "border-[#e8e2d9] bg-white"
              : "border-[#e4dfd7] bg-[#fcfaf7]"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-[#1f312f]">{hub.name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                  hub.isActive ? "bg-green-50 text-green-700" : "bg-slate-200 text-slate-600"
                }`}>
                  {hub.isActive ? "● نشط" : "● معطّل"}
                </span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-600">
                  {hub.city}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#faf8f4] px-4 py-3">
                  <p className="mb-1 text-[11px] font-extrabold text-[#9b948c]">العنوان</p>
                  <p className="flex items-start gap-2 text-sm leading-6 text-[#5f5a54]">
                    <span className="material-symbols-outlined mt-0.5 text-[16px] text-[#9b948c]">location_on</span>
                    {hub.address}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#faf8f4] px-4 py-3">
                  <p className="mb-1 text-[11px] font-extrabold text-[#9b948c]">ساعات العمل</p>
                  <p className="flex items-start gap-2 text-sm leading-6 text-[#5f5a54]">
                    <span className="material-symbols-outlined mt-0.5 text-[16px] text-[#9b948c]">schedule</span>
                    {hub.workingHours}
                  </p>
                </div>
              </div>

              {hub.coordinates && (
                <a
                  href={`https://maps.google.com/?q=${hub.coordinates.lat},${hub.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-black text-primary hover:bg-primary/10"
                >
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  فتح على خرائط Google
                </a>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(hub)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3f0ea] text-[#68635d] hover:bg-[#e9e3db]"
                title="تعديل"
                aria-label={`تعديل ${hub.name}`}
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleActive(hub)}
                disabled={Boolean(busy[hub._id])}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl disabled:opacity-50 ${
                  hub.isActive
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
                title={hub.isActive ? "تعطيل المركز" : "تفعيل المركز"}
                aria-label={`${hub.isActive ? "تعطيل" : "تفعيل"} ${hub.name}`}
              >
                {busy[hub._id] ? (
                  <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    {hub.isActive ? "pause_circle" : "play_circle"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
