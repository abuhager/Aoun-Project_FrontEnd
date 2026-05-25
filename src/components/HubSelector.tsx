"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axiosInstance";
import { SafeHub } from "@/types/hub.types";

interface Props {
  value: string;
  onChange: (hubId: string) => void;
}

export function HubSelector({ value, onChange }: Props) {
  const [hubs, setHubs] = useState<SafeHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const { data } = await axiosInstance.get("/api/hubs");
        // يدعم { hubs: [...] } أو مصفوفة مباشرة
        const list: SafeHub[] = Array.isArray(data) ? data : (data.hubs ?? []);
        setHubs(list.filter((h) => h.isActive)); // ✅ فقط المراكز النشطة
      } catch {
        setError("تعذر تحميل مراكز التسليم");
      } finally {
        setLoading(false);
      }
    };
    fetchHubs();
  }, []);

  return (
    <div className="space-y-2">
      <label className="block font-bold text-xs md:text-sm mr-1">
        مركز التسليم
        <span className="text-on-surface-variant font-normal mr-1">
          (اختياري)
        </span>
      </label>

      {/* ─── حالة التحميل ─── */}
      {loading && (
        <div className="w-full bg-surface-container-low rounded-xl px-4 py-3 flex items-center gap-2 text-on-surface-variant text-sm">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>جاري تحميل المراكز...</span>
        </div>
      )}

      {/* ─── حالة الخطأ ─── */}
      {error && <p className="text-red-500 text-xs font-bold px-1">{error}</p>}

      {/* ─── القائمة ─── */}
      {!loading && !error && (
        <div className="relative">
          <select
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none bg-surface-container-low text-sm md:text-base border-none rounded-xl px-4 py-3 md:px-5 md:py-4 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
          >
            <option value="" disabled>
              اختر مركز التسليم
            </option>{" "}{hubs.map((hub) => (
              <option key={hub._id} value={hub._id}>
                {hub.name} — {hub.city}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
            warehouse
          </span>
        </div>
      )}

      {/* ─── معلومات المركز المختار ─── */}
      {value &&
        !loading &&
        (() => {
          const selected = hubs.find((h) => h._id === value);
          if (!selected) return null;
          return (
            <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 space-y-1">
              <p className="text-xs font-black text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  location_on
                </span>
                {selected.address}
              </p>
              <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>
                {selected.workingHours}
              </p>
            </div>
          );
        })()}
    </div>
  );
}
