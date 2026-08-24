"use client";

import useSWR from "swr";
import {
  getPublicSettings,
  PUBLIC_SETTINGS_CACHE_KEY,
} from "@/lib/api/settingsApi";
import type { PublicSettings } from "@/types/settings.types";

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<PublicSettings | null>(
    PUBLIC_SETTINGS_CACHE_KEY,
    getPublicSettings,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60_000,
    }
  );

  return {
    settings: data ?? null,
    categories: data?.categories ?? [],
    reportReasons: data?.reportReasons ?? [],
    isLoading,
    isError: Boolean(error),
    refresh: mutate,
  };
}
