// src/hooks/useSettings.ts
// ✅ لا تغيير في import — getPublicSettings موجودة بنفس الاسم
// ✅ النوع مُحدَّد بـ Pick لأن getPublicSettings ترجع public fields فقط

import useSWR from "swr";
import { getPublicSettings } from "@/lib/api/settingsApi";
import type { SystemSettings } from "@/types/settings.types";

type PublicSettings = Pick<SystemSettings, "categories" | "reportReasons">;

export function useSettings() {
  const { data, error, isLoading } = useSWR<PublicSettings>(
    "public-settings",
    getPublicSettings,
    {
      revalidateOnFocus: false,
      dedupingInterval:  60_000,
    }
  );

  return {
    settings:   data,
    categories: data?.categories   ?? [],
    reportReasons: data?.reportReasons ?? [],
    isLoading,
    isError:    !!error,
  };
}