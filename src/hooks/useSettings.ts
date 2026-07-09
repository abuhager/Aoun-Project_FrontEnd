// src/hooks/useSettings.ts
"use client";

import useSWR from "swr";
import { getPublicSettings } from "@/lib/api/settingsApi"; 
import type { PublicSettings } from "@/types/settings.types";

export function useSettings() {
  // 👈 Fixed: Changed <any> to <unknown> to eliminate ESLint error while supporting your flexible fallback below
  const { data, error, isLoading } = useSWR<unknown>(
    "public-settings",
    async () => {
      const res = await getPublicSettings();
      return res;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60_000,
    }
  );

  // Cast safely after applying your runtime fallbacks
  const resolvedData = (data as { data?: PublicSettings } | undefined)?.data || (data as PublicSettings) || null;
  const cleanSettings: PublicSettings | null = resolvedData;

  return {
    settings: cleanSettings,
    categories: cleanSettings?.categories ?? [],
    reportReasons: cleanSettings?.reportReasons ?? [],
    isLoading,
    isError: !!error,
  };
}