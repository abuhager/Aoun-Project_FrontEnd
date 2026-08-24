"use client";

import { useMemo } from "react";
import { SWRConfig, type SWRConfiguration } from "swr";
import { API_SWR_CONFIG } from "@/lib/api/swrConfig";
import { PUBLIC_SETTINGS_CACHE_KEY } from "@/lib/api/publicSettingsApi";
import type { PublicSettings } from "@/types/settings.types";

export default function ApiStateProvider({
  children,
  initialPublicSettings,
}: {
  children: React.ReactNode;
  initialPublicSettings: PublicSettings | null;
}) {
  const value = useMemo<SWRConfiguration>(() => ({
    ...API_SWR_CONFIG,
    fallback: initialPublicSettings
      ? { [PUBLIC_SETTINGS_CACHE_KEY]: initialPublicSettings }
      : {},
  }), [initialPublicSettings]);

  return <SWRConfig value={value}>{children}</SWRConfig>;
}
