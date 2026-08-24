// src/components/HubSelector.tsx — ✅ PATCHED [LOGIC-03]
"use client";

import { usePublicHubs } from "@/hooks/usePublicHubs";

interface Props {
  value:     string;
  onChange:  (hubId: string) => void;
  // ✅ LOGIC-03: error prop صريح — الـ parent يتحكم في validation
  error?:    string;
  required?: boolean;
}

export function HubSelector({ value, onChange, error, required }: Props) {
  const {
    hubs,
    error: hubsError,
    isLoading: loading,
    refresh,
  } = usePublicHubs();
  const fetchError = hubsError ? "تعذر تحميل مراكز التسليم" : "";

  const selectedHub = hubs.find((h) => h._id === value);

  return (
    <div className="space-y-2">
      <label className="block font-bold text-xs md:text-sm mr-1">
        مركز التسليم
        {required && <span className="text-red-500 mr-1">*</span>}
        {!required && (
          <span className="text-on-surface-variant font-normal mr-1">(اختياري)</span>
        )}
      </label>

      {/* حالة التحميل */}
      {loading && (
        <div className="w-full bg-surface-container-low rounded-xl px-4 py-3
          flex items-center gap-2 text-on-surface-variant text-sm">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent
            rounded-full animate-spin" />
          <span>جاري تحميل المراكز...</span>
        </div>
      )}

      {/* خطأ في الجلب */}
      {fetchError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
          <p className="text-red-600 text-xs font-bold">{fetchError}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="shrink-0 text-xs font-black text-primary hover:underline"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* القائمة */}
      {!loading && !fetchError && (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            aria-required={required}
            aria-invalid={!!error}
            disabled={hubs.length === 0}
            className={`w-full appearance-none bg-surface-container-low text-sm md:text-base
              border rounded-xl px-4 py-3 md:px-5 md:py-4 outline-none transition-all
              focus:ring-2 focus:ring-primary/20 focus:bg-white
              ${error
                ? "border-red-400 bg-red-50/30"
                : "border-none"
              }`}
          >
            <option value="" disabled={required}>
              {hubs.length === 0 ? "لا توجد مراكز متاحة" : "اختر مركز التسليم"}
            </option>
            {hubs.map((hub) => (
              <option key={hub._id} value={hub._id}>
                {hub.name} — {hub.city}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute left-4 top-1/2
            -translate-y-1/2 pointer-events-none text-outline">
            warehouse
          </span>
        </div>
      )}

      {/* ✅ LOGIC-03: رسالة الخطأ من الـ parent — تظهر عند محاولة Submit بدون اختيار */}
      {error && (
        <p className="text-red-500 text-xs font-bold px-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}

      {/* معلومات المركز المختار */}
      {selectedHub && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 space-y-1">
          <p className="text-xs font-black text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {selectedHub.address}
          </p>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {selectedHub.workingHours}
          </p>
        </div>
      )}
    </div>
  );
}
