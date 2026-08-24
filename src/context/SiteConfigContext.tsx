"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { siteConfig } from "@/config/site.config";
import type { PublicSettings } from "@/types/settings.types";

type LiveSiteConfig = Pick<
  PublicSettings,
  | "platformName"
  | "contactEmail"
  | "maxAvatarSizeMb"
  | "requireHubForBooking"
  | "maintenanceMode"
  | "updatedAt"
>;

type SiteConfigType = LiveSiteConfig & {
  applyPublicSettings: (settings: PublicSettings) => void;
};

const FALLBACK_CONFIG: LiveSiteConfig = {
  platformName: siteConfig.name,
  contactEmail: siteConfig.contactEmail,
  maxAvatarSizeMb: 5,
  requireHubForBooking: false,
  maintenanceMode: false,
  updatedAt: null,
};

const resolveConfig = (settings: PublicSettings | null): LiveSiteConfig => ({
  platformName: settings?.platformName || FALLBACK_CONFIG.platformName,
  contactEmail: settings?.contactEmail || FALLBACK_CONFIG.contactEmail,
  maxAvatarSizeMb: settings?.maxAvatarSizeMb ?? FALLBACK_CONFIG.maxAvatarSizeMb,
  requireHubForBooking:
    settings?.requireHubForBooking ?? FALLBACK_CONFIG.requireHubForBooking,
  maintenanceMode: settings?.maintenanceMode ?? FALLBACK_CONFIG.maintenanceMode,
  updatedAt: settings?.updatedAt ?? null,
});

const SiteConfigContext = createContext<SiteConfigType>({
  ...FALLBACK_CONFIG,
  applyPublicSettings: () => {},
});

export function SiteConfigProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: PublicSettings | null;
}) {
  const [config, setConfig] = useState<LiveSiteConfig>(() => resolveConfig(settings));

  const applyPublicSettings = useCallback((nextSettings: PublicSettings) => {
    setConfig(resolveConfig(nextSettings));
  }, []);

  const value = useMemo<SiteConfigType>(
    () => ({ ...config, applyPublicSettings }),
    [applyPublicSettings, config]
  );

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export const useSiteConfig = () => useContext(SiteConfigContext);
