import useSWR from "swr";
import { getPublicSettings } from "@/lib/api/settingsApi";
import type { SystemSettings } from "@/types/settings.types";

export function useSettings() {
  const { data, error, isLoading } = useSWR<SystemSettings>(
    "public-settings",
    getPublicSettings,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );

  return {
    settings: data,
    categories: data?.categories ?? [],
    isLoading,
    isError: !!error,
  };
}