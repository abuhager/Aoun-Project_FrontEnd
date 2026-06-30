// src/context/SiteConfigContext.tsx
"use client";
import { createContext, useContext, useMemo } from "react";
import { siteConfig } from "@/config/site.config";

type SiteConfigType = {
  platformName: string;
  contactEmail: string;
};

const SiteConfigContext = createContext<SiteConfigType>({
  platformName: siteConfig.name,
  contactEmail: "aoun.help.center@gmail.com",
});

export function SiteConfigProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: SiteConfigType | null;
}) {
  const config = useMemo<SiteConfigType>(
    () => ({
      platformName: settings?.platformName ?? siteConfig.name,
      contactEmail: settings?.contactEmail ?? "aoun.help.center@gmail.com",
    }),
    [settings?.platformName, settings?.contactEmail]
  );

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export const useSiteConfig = () => useContext(SiteConfigContext);