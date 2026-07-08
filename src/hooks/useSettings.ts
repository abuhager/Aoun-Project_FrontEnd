import useSWR from "swr";
import { getPublicSettings } from "@/lib/api/settingsApi"; // المسار الصحيح للمشروع
import type { PublicSettings } from "@/types/settings.types";

export function useSettings() {
  const { data, error, isLoading } = useSWR<PublicSettings | null>(
    "public-settings",
    async () => {
      const res = await getPublicSettings();
      return res;
    },
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