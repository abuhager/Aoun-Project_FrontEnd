import useSWR from "swr";
import { getPublicSettings } from "@/lib/api/settingsApi";
import type { PublicSettings } from "@/types/settings.types";

export function useSettings() {
  const { data, error, isLoading } = useSWR<PublicSettings>(
    "public-settings",
    getPublicSettings,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60_000,
      revalidateOnMount: false,
    }
  );

  return {
    settings: data,
    categories: data?.categories ?? [],
    reportReasons: data?.reportReasons ?? [],
    isLoading,
    isError: !!error,
  };
}