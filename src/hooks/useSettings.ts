// src/hooks/useSettings.ts
"use client";

import useSWR from "swr";
import { getPublicSettings } from "@/lib/api/settingsApi"; 
import type { PublicSettings } from "@/types/settings.types";

export function useSettings() {
  const { data, error, isLoading } = useSWR<any>(
    "public-settings",
    async () => {
      const res = await getPublicSettings();
      return res;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60_000,
      // 🌟 تم حذف revalidateOnMount: false لإجبار الصفحة على سحب الداتا فوراً عند فتحها
    }
  );

  // 🌟 تطهير ذكي للبيانات (Safe Extraction): السيرفر غالباً يعود بـ res.data أو res مباشرة
  const cleanSettings: PublicSettings | null = data?.data || data || null;

  return {
    settings: cleanSettings,
    // قراءة المصفوفة من الكائن النظيف مع fallback آمن لحماية الـ Map
    categories: cleanSettings?.categories ?? [],
    reportReasons: cleanSettings?.reportReasons ?? [],
    isLoading,
    isError: !!error,
  };
}