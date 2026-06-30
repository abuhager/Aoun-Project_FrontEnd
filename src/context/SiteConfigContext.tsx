// src/context/SiteConfigContext.tsx
"use client";
import { createContext, useContext } from "react";
import { siteConfig } from "@/config/site.config";

type SiteConfigType = {
  platformName: string;
  contactEmail: string;
};

const SiteConfigContext = createContext<SiteConfigType>({
  platformName: siteConfig.name,   // ← fallback
  contactEmail: "support@aoun.jo",
});

export function SiteConfigProvider({
  children,
  settings,        // ← يجيه من Server Component
}: {
  children: React.ReactNode;
  settings: SiteConfigType | null;
}) {
  const value = {
    platformName: settings?.platformName ?? siteConfig.name,  // ← DB أو fallback
    contactEmail: settings?.contactEmail ?? "support@aoun.jo",
  };

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export const useSiteConfig = () => useContext(SiteConfigContext);